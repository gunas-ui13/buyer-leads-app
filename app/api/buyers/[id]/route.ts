import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET individual buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership - users can only see their own leads, admins can see all
    if (user.role !== 'admin' && buyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer' },
      { status: 500 }
    );
  }
}

// PUT update buyer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    
    // Check if buyer exists and user has permission
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id }
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership - users can only edit their own leads, admins can edit all
    if (user.role !== 'admin' && existingBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedBuyer = await prisma.buyer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: data.bhk,
        purpose: data.purpose,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        timeline: data.timeline,
        source: data.source,
        status: data.status,
        notes: data.notes,
        tags: data.tags,
      }
    });

    // Create history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: updatedBuyer.id,
        changedBy: user.id,
        diff: {
          action: 'updated',
          fields: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            city: data.city,
            propertyType: data.propertyType,
            bhk: data.bhk,
            purpose: data.purpose,
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
            timeline: data.timeline,
            source: data.source,
            status: data.status,
            notes: data.notes,
            tags: data.tags,
          }
        }
      }
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to update buyer' },
      { status: 500 }
    );
  }
}

// DELETE buyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if buyer exists and user has permission
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id }
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Check ownership - users can only delete their own leads, admins can delete all
    if (user.role !== 'admin' && existingBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete buyer (history will be cascade deleted)
    await prisma.buyer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 }
    );
  }
}
