import { prisma } from './prisma';

export async function getLeadStats(userId: string, userRole: string) {
  try {
    // Build where clause based on user role
    const whereClause = userRole === 'admin' ? {} : { ownerId: userId };

    // Get total leads
    const totalLeads = await prisma.buyer.count({
      where: whereClause
    });

    // Get leads by status
    const qualifiedLeads = await prisma.buyer.count({
      where: {
        ...whereClause,
        status: 'Qualified'
      }
    });

    const inProgressLeads = await prisma.buyer.count({
      where: {
        ...whereClause,
        status: {
          in: ['Contacted', 'Visited', 'Negotiation']
        }
      }
    });

    const convertedLeads = await prisma.buyer.count({
      where: {
        ...whereClause,
        status: 'Converted'
      }
    });

    // Get recent leads (last 5)
    const recentLeads = await prisma.buyer.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        status: true,
        updatedAt: true
      }
    });

    return {
      totalLeads,
      qualifiedLeads,
      inProgressLeads,
      convertedLeads,
      recentLeads
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return {
      totalLeads: 0,
      qualifiedLeads: 0,
      inProgressLeads: 0,
      convertedLeads: 0,
      recentLeads: []
    };
  }
}
