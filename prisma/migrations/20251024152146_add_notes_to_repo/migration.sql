-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "repoPath" TEXT NOT NULL,
    "primaryLanguage" TEXT NOT NULL,
    "frameworks" TEXT NOT NULL,
    "ciStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastOpenedAt" DATETIME,
    "notes" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Repo" ("createdAt", "description", "frameworks", "id", "name", "primaryLanguage", "repoPath", "slug", "stars", "updatedAt") SELECT "createdAt", "description", "frameworks", "id", "name", "primaryLanguage", "repoPath", "slug", "stars", "updatedAt" FROM "Repo";
DROP TABLE "Repo";
ALTER TABLE "new_Repo" RENAME TO "Repo";
CREATE UNIQUE INDEX "Repo_slug_key" ON "Repo"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
