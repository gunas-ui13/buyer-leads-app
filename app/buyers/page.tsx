import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BuyersList from './BuyersList';

interface SearchParams {
  [key: string]: string | string[] | undefined;
  page?: string;
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sort?: string;
}

interface BuyersPageProps {
  searchParams: SearchParams;
}

async function getBuyers(searchParams: SearchParams, user: { id: string; role: string }) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page || '1');
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const {
    search = '',
    city = '',
    propertyType = '',
    status = '',
    timeline = '',
    sort = 'updatedAt_desc'
  } = awaitedSearchParams;

  // Build where clause
  const where: Record<string, unknown> = {};
  
  // Ownership check - users can only see their own leads, admins can see all
  if (user.role !== 'admin') {
    where.ownerId = user.id;
  }
  
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  // Build orderBy clause
  const [sortField, sortOrder] = sort.split('_');
  const orderBy: Record<string, string> = {};
  orderBy[sortField] = sortOrder;

  const [buyers, totalCount] = await Promise.all([
    prisma.buyer.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.buyer.count({ where })
  ]);

  // For admin users, we need to get owner information
  // This is a simplified approach - in production you'd want to use Prisma relations
  let buyersWithOwners = buyers;
  if (user.role === 'admin') {
    // In a real app, you'd use Prisma relations, but for now we'll add a placeholder
    buyersWithOwners = buyers.map(buyer => ({
      ...buyer,
      owner: {
        name: 'User',
        email: 'user@example.com'
      }
    }));
  }

  return {
    buyers: buyersWithOwners,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    }
  };
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const { buyers, pagination } = await getBuyers(searchParams, user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Buyer Leads
              </h1>
              <p className="text-xl text-slate-600 mt-2">
                Manage and track your property buyer leads
                {user.role === 'admin' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin View - All Leads
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/buyers/import"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Import CSV
              </Link>
              <Link
                href="/buyers/new"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Add New Lead
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Total Leads</p>
                <p className="text-3xl font-bold text-slate-800">{pagination.totalCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">New Leads</p>
                <p className="text-3xl font-bold text-slate-800">
                  {buyers.filter(b => b.status === 'New').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Qualified</p>
                <p className="text-3xl font-bold text-slate-800">
                  {buyers.filter(b => b.status === 'Qualified').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-medium mb-2">Converted</p>
                <p className="text-3xl font-bold text-slate-800">
                  {buyers.filter(b => b.status === 'Converted').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Buyers List */}
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <BuyersList 
            initialBuyers={buyers} 
            pagination={pagination}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
