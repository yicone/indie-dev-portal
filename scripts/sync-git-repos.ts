#!/usr/bin/env tsx
/**
 * Sync git repositories from local filesystem to database
 * Scans configured paths for git repos and updates the database
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { scanAndParseRepos } from "../lib/gitService";

async function syncRepos() {
  console.log("🔍 Scanning for git repositories...\n");

  // Get scan paths from environment
  const scanPathsEnv = process.env.GIT_SCAN_PATHS || "";
  const scanPaths = scanPathsEnv
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (scanPaths.length === 0) {
    console.error("❌ No scan paths configured!");
    console.error("   Set GIT_SCAN_PATHS in your .env file");
    console.error('   Example: GIT_SCAN_PATHS="/Users/username/Projects"');
    process.exit(1);
  }

  const maxDepth = Number(process.env.GIT_SCAN_DEPTH) || 2;

  console.log(`📂 Scan paths: ${scanPaths.join(", ")}`);
  console.log(`📊 Max depth: ${maxDepth}\n`);

  // Scan and parse repositories
  const repoInfos = await scanAndParseRepos(scanPaths, maxDepth);

  console.log(`✅ Found ${repoInfos.length} git repositories\n`);

  if (repoInfos.length === 0) {
    console.log("No repositories found. Exiting.");
    return;
  }

  // Sync to database
  let created = 0;
  let updated = 0;

  for (const repoInfo of repoInfos) {
    try {
      // Check if repo exists
      const existing = await prisma.repo.findUnique({
        where: { slug: repoInfo.slug },
      });

      if (existing) {
        // Update existing repo (preserve notes and lastOpenedAt)
        await prisma.repo.update({
          where: { slug: repoInfo.slug },
          data: {
            name: repoInfo.name,
            description: repoInfo.description,
            repoPath: repoInfo.repoPath,
            primaryLanguage: repoInfo.primaryLanguage,
            frameworks: JSON.stringify(repoInfo.frameworks),
            ciStatus: repoInfo.ciStatus,
            // Keep existing notes and lastOpenedAt
          },
        });

        // Delete old commits and insert new ones
        await prisma.commit.deleteMany({
          where: { repoId: existing.id },
        });

        await prisma.commit.createMany({
          data: repoInfo.commits.map((commit) => ({
            hash: commit.hash,
            message: commit.message,
            author: commit.author,
            committedAt: commit.committedAt,
            repoId: existing.id,
          })),
        });

        updated++;
        console.log(`  ✓ Updated: ${repoInfo.name}`);
      } else {
        // Create new repo
        const newRepo = await prisma.repo.create({
          data: {
            name: repoInfo.name,
            slug: repoInfo.slug,
            description: repoInfo.description,
            repoPath: repoInfo.repoPath,
            primaryLanguage: repoInfo.primaryLanguage,
            frameworks: JSON.stringify(repoInfo.frameworks),
            ciStatus: repoInfo.ciStatus,
            lastOpenedAt: null,
            notes: null,
            stars: 0,
            commits: {
              create: repoInfo.commits.map((commit) => ({
                hash: commit.hash,
                message: commit.message,
                author: commit.author,
                committedAt: commit.committedAt,
              })),
            },
          },
        });

        created++;
        console.log(`  + Created: ${repoInfo.name}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to sync ${repoInfo.name}:`, error);
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total: ${created + updated}\n`);
}

syncRepos()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
