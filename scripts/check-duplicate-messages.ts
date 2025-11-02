/**
 * Check for duplicate messages in the database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate messages...\n');

  // Get all sessions
  const sessions = await prisma.agentSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  for (const session of sessions) {
    console.log(`\n📋 Session: ${session.id}`);
    console.log(`   Created: ${session.createdAt}`);

    const messages = await prisma.agentMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { timestamp: 'asc' },
    });

    console.log(`   Messages: ${messages.length} total`);

    // Group by content to find duplicates
    const contentMap = new Map<string, string[]>();
    for (const msg of messages) {
      const key = `${msg.role}:${msg.content.substring(0, 100)}`;
      if (!contentMap.has(key)) {
        contentMap.set(key, []);
      }
      contentMap.get(key)!.push(msg.id);
    }

    // Find duplicates
    let duplicateCount = 0;
    for (const [content, ids] of contentMap.entries()) {
      if (ids.length > 1) {
        duplicateCount++;
        console.log(`   ⚠️  DUPLICATE (${ids.length}x):`);
        console.log(`      Content: ${content.substring(0, 80)}...`);
        console.log(`      IDs: ${ids.join(', ')}`);
      }
    }

    if (duplicateCount === 0) {
      console.log(`   ✅ No duplicates found`);
    } else {
      console.log(`   ❌ Found ${duplicateCount} duplicate message(s)`);
    }
  }

  await prisma.$disconnect();
}

checkDuplicates().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
