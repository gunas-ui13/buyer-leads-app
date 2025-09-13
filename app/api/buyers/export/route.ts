import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define filter type
type BuyerFilter = Prisma.BuyerWhereInput;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const status = searchParams.get('status') || '';
    const timeline = searchParams.get('timeline') || '';

    // Build where clause
    const where: BuyerFilter = {};

    // Ownership check - users can only see their own leads, admins can see all
    if (user.role !== 'admin') {
      where.ownerId = user.id;
    }

    // Apply filters
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    // Get all matching leads
    const leads = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    // Convert to CSV format
    const csvHeaders = [
      'Full Name',
      'Email',
      'Phone',
      'City',
      'Property Type',
      'BHK',
      'Purpose',
      'Min Budget (₹)',
      'Max Budget (₹)',
      'Timeline',
      'Source',
      'Status',
      'Notes',
      'Tags',
      'Updated At',
    ];

    const csvRows = leads.map((lead) => [
      lead.fullName,
      lead.email || '',
      lead.phone,
      lead.city,
      lead.propertyType,
      lead.bhk ?? '',
      lead.purpose,
      lead.budgetMin ?? '',
      lead.budgetMax ?? '',
      lead.timeline,
      lead.source,
      lead.status,
      lead.notes || '',
      lead.tags || '',
      new Date(lead.updatedAt).toLocaleDateString(),
    ]);

    // Create CSV content with proper escaping
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row
          .map((field) =>
            typeof field === 'string' && field.includes(',')
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(',')
      ),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyer-leads-${new Date()
          .toISOString()
          .split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
