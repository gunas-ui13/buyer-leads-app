import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
// Prisma types are used for type safety but not directly in the component

interface BuyerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getBuyer(id: string, user: { id: string; role: string }) {
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: { changedAt: 'desc' },
        take: 10
      }
    }
  });

  if (!buyer) {
    return null;
  }

  // Check ownership - users can only see their own leads, admins can see all
  if (user.role !== 'admin' && buyer.ownerId !== user.id) {
    return null;
  }

  return buyer;
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const buyer = await getBuyer(id, user);

  if (!buyer) {
    notFound();
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      New: 'bg-blue-100 text-blue-800',
      Qualified: 'bg-green-100 text-green-800',
      Contacted: 'bg-yellow-100 text-yellow-800',
      Visited: 'bg-purple-100 text-purple-800',
      Negotiation: 'bg-orange-100 text-orange-800',
      Converted: 'bg-emerald-100 text-emerald-800',
      Dropped: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Buyer Details
              </h1>
              <p className="text-xl text-slate-600 mt-2">
                Complete information about {buyer.fullName}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/buyers"
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                ← Back to Leads
              </Link>
              <Link
                href={`/buyers/${buyer.id}/edit`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Edit Lead
              </Link>
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                <p className="text-lg text-slate-800">{buyer.fullName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                <p className="text-lg text-slate-800">{buyer.email || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Phone</label>
                <p className="text-lg text-slate-800">{buyer.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">City</label>
                <p className="text-lg text-slate-800">{buyer.city}</p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Property Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Property Type</label>
                <p className="text-lg text-slate-800">{buyer.propertyType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">BHK</label>
                <p className="text-lg text-slate-800">{buyer.bhk || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Purpose</label>
                <p className="text-lg text-slate-800">{buyer.purpose}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Budget</label>
                <p className="text-lg text-slate-800">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
              </div>
            </div>
          </div>

          {/* Timeline & Source */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Timeline & Source</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Timeline</label>
                <p className="text-lg text-slate-800">{buyer.timeline.replace('_', ' - ')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Source</label>
                <p className="text-lg text-slate-800">{buyer.source}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(buyer.status)}`}>
                  {buyer.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Last Updated</label>
                <p className="text-lg text-slate-800">{new Date(buyer.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Notes & Tags */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Notes & Tags</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Notes</label>
                <p className="text-lg text-slate-800 whitespace-pre-wrap">
                  {buyer.notes || 'No notes provided'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {buyer.tags ? (
                    buyer.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500">No tags</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        {buyer.history && buyer.history.length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {buyer.history.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {entry.diff.action === 'created' ? 'Lead created' : 'Lead updated'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(entry.changedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
