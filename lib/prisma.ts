import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use in-memory database for development
const databaseUrl = process.env.DATABASE_URL || "file:./database.db"

console.log('DATABASE_URL:', databaseUrl)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma