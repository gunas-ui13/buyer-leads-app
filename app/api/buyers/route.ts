import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const data = await req.json();
    const buyer = await prisma.buyer.create({
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
        notes: data.notes,
        tags: data.tags,
        ownerId: user.id,
      },
    });

    // Create history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: user.id,
        diff: {
          action: 'created',
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
            notes: data.notes,
            tags: data.tags,
          }
        }
      }
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
