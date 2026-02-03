import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    logger.info('✓ Database connection successful')
    return true
  } catch (error) {
    logger.error('✗ Database connection failed', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  logger.info('Database connection closed')
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectDatabase()
})
