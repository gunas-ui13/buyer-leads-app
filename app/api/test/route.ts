import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      result 
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      databaseUrl: process.env.DATABASE_URL 
    }, { status: 500 });
  }
}
