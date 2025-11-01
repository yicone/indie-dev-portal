-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "agentType" TEXT NOT NULL DEFAULT 'gemini-cli',
    "agentVersion" TEXT NOT NULL DEFAULT '0.11.3',
    "supportsResume" BOOLEAN NOT NULL DEFAULT false,
    "resumeData" TEXT,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentSession_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AgentSession" ("createdAt", "id", "repoId", "status", "updatedAt") SELECT "createdAt", "id", "repoId", "status", "updatedAt" FROM "AgentSession";

-- Data migration: Convert 'cancelled' sessions to 'suspended'
-- Rationale: Prepare for future session resumption support
-- Old 'cancelled' sessions from server shutdown should be 'suspended' (may be resumable)
UPDATE "new_AgentSession" 
SET status = 'suspended', 
    lastActiveAt = CURRENT_TIMESTAMP
WHERE status = 'cancelled';

DROP TABLE "AgentSession";
ALTER TABLE "new_AgentSession" RENAME TO "AgentSession";
CREATE INDEX "AgentSession_repoId_idx" ON "AgentSession"("repoId");
CREATE INDEX "AgentSession_status_idx" ON "AgentSession"("status");
CREATE INDEX "AgentSession_updatedAt_idx" ON "AgentSession"("updatedAt");
CREATE INDEX "AgentSession_lastActiveAt_idx" ON "AgentSession"("lastActiveAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
