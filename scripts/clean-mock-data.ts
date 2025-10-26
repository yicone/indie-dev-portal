#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Remove mock seeded data from database
 * Keeps real git repositories, removes only mock data
 */

import { prisma } from '../lib/prisma';

const MOCK_SLUGS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

async function cleanMockData() {
  console.log('🧹 Cleaning mock data from database...\n');

  try {
    // Delete commits for mock repos first (foreign key constraint)
    const deletedCommits = await prisma.commit.deleteMany({
      where: {
        repo: {
          slug: {
            in: MOCK_SLUGS,
          },
        },
      },
    });

    console.log(`  ✓ Deleted ${deletedCommits.count} mock commits`);

    // Delete mock repos
    const deletedRepos = await prisma.repo.deleteMany({
      where: {
        slug: {
          in: MOCK_SLUGS,
        },
      },
    });

    console.log(`  ✓ Deleted ${deletedRepos.count} mock repositories`);

    // Count remaining repos
    const remaining = await prisma.repo.count();

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Remaining repositories: ${remaining}\n`);
  } catch (error) {
    console.error('❌ Error cleaning mock data:', error);
    process.exit(1);
  }
}

cleanMockData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
