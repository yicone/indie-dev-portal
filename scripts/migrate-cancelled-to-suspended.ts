#!/usr/bin/env tsx
/**
 * Migrate cancelled sessions to suspended status
 *
 * This script updates all 'cancelled' sessions to 'suspended' to make them
 * visible in the UI and prepare for future session resumption support.
 *
 * Usage: tsx scripts/migrate-cancelled-to-suspended.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migrating cancelled sessions to suspended...');

  const result = await prisma.agentSession.updateMany({
    where: { status: 'cancelled' },
    data: {
      status: 'suspended',
      lastActiveAt: new Date(),
    },
  });

  console.log(`✅ Migrated ${result.count} sessions from 'cancelled' to 'suspended'`);

  // Show current status distribution
  const statusCounts = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
    SELECT status, COUNT(*) as count 
    FROM AgentSession 
    GROUP BY status
  `;

  console.log('\n📊 Current session status distribution:');
  statusCounts.forEach(({ status, count }) => {
    console.log(`  ${status}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
