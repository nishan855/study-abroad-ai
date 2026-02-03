/**
 * Database Connection Test Script
 *
 * Tests the database connection and verifies schema integrity
 *
 * Usage: npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL'
  message?: string
}

const results: TestResult[] = []

async function runTests() {
  console.log('🔍 Testing Database Connection...\n')

  // Test 1: Database Connection
  try {
    await prisma.$connect()
    results.push({
      name: 'Database Connection',
      status: 'PASS',
    })
    console.log('✓ Database connection successful')
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    console.log('✗ Database connection failed')
    return // Can't continue without connection
  }

  // Test 2: Check if tables exist
  try {
    await prisma.user.findMany({ take: 1 })
    results.push({
      name: 'User table exists',
      status: 'PASS',
    })
    console.log('✓ User table exists')
  } catch (error) {
    results.push({
      name: 'User table exists',
      status: 'FAIL',
      message: 'Table not found. Run migrations first.',
    })
    console.log('✗ User table not found. Did you run migrations?')
  }

  // Test 3: Check University table
  try {
    await prisma.university.findMany({ take: 1 })
    results.push({
      name: 'University table exists',
      status: 'PASS',
    })
    console.log('✓ University table exists')
  } catch (error) {
    results.push({
      name: 'University table exists',
      status: 'FAIL',
      message: 'Table not found',
    })
    console.log('✗ University table not found')
  }

  // Test 4: Check Program table
  try {
    await prisma.program.findMany({ take: 1 })
    results.push({
      name: 'Program table exists',
      status: 'PASS',
    })
    console.log('✓ Program table exists')
  } catch (error) {
    results.push({
      name: 'Program table exists',
      status: 'FAIL',
      message: 'Table not found',
    })
    console.log('✗ Program table not found')
  }

  // Test 5: Check Conversation table
  try {
    await prisma.conversation.findMany({ take: 1 })
    results.push({
      name: 'Conversation table exists',
      status: 'PASS',
    })
    console.log('✓ Conversation table exists')
  } catch (error) {
    results.push({
      name: 'Conversation table exists',
      status: 'FAIL',
      message: 'Table not found',
    })
    console.log('✗ Conversation table not found')
  }

  // Test 6: Count records (if any)
  try {
    const userCount = await prisma.user.count()
    const universityCount = await prisma.university.count()
    const programCount = await prisma.program.count()

    console.log(`\n📊 Database Statistics:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Universities: ${universityCount}`)
    console.log(`   Programs: ${programCount}`)

    if (universityCount === 0 || programCount === 0) {
      console.log('\n💡 Tip: Run seed script to populate database with sample data')
      console.log('   cd backend && npm run db:seed')
    }

    results.push({
      name: 'Database statistics',
      status: 'PASS',
    })
  } catch (error) {
    results.push({
      name: 'Database statistics',
      status: 'FAIL',
      message: 'Could not retrieve counts',
    })
  }

  // Test 7: Test write operation (create and delete)
  try {
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      },
    })

    await prisma.user.delete({
      where: { id: testUser.id },
    })

    results.push({
      name: 'Write operations',
      status: 'PASS',
    })
    console.log('✓ Write operations working')
  } catch (error) {
    results.push({
      name: 'Write operations',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    console.log('✗ Write operations failed')
  }

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('Test Summary')
  console.log('='.repeat(50))

  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length

  console.log(`Total: ${results.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n❌ Some tests failed:\n')
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`   ${r.name}: ${r.message || 'No message'}`)
      })
  } else {
    console.log('\n✅ All tests passed!')
  }

  // Cleanup
  await prisma.$disconnect()

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
