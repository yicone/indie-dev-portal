# Database Migration Guide

## Overview

This project uses Prisma for database migrations. This guide covers best practices for schema and data migrations.

## Migration Strategies

### Simple Data Transformations → Use SQL

**When to use**:

- Status mapping
- Field renaming
- Default value population
- Simple CASE WHEN logic

**Example**:

```sql
-- migration.sql
PRAGMA foreign_keys=OFF;

-- Schema changes (auto-generated)
CREATE TABLE "new_AgentSession" (...);
INSERT INTO "new_AgentSession" (...) SELECT ... FROM "AgentSession";

-- Data migration (manually added) ⭐
UPDATE "new_AgentSession"
SET status = CASE
  WHEN status = 'completed' THEN 'active'
  WHEN status = 'cancelled' THEN 'archived'
  ELSE status
END
WHERE status IN ('completed', 'cancelled');

DROP TABLE "AgentSession";
ALTER TABLE "new_AgentSession" RENAME TO "AgentSession";

PRAGMA foreign_keys=ON;
```

**Advantages**:

- ✅ Atomic (single transaction)
- ✅ Automatic execution
- ✅ One-step process

### Complex Business Logic → Use TypeScript Script

**When to use**:

- Multi-table queries
- API calls required
- Complex calculations
- Conditional logic

**Example**:

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Complex logic here
  const sessions = await prisma.agentSession.findMany({
    include: { messages: true },
  });

  for (const session of sessions) {
    // Complex transformation
    await prisma.agentSession.update({
      where: { id: session.id },
      data: {
        /* ... */
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Advantages**:

- ✅ Flexible (TypeScript)
- ✅ Better error handling
- ✅ Can use Prisma client

**Disadvantages**:

- ⚠️ Must remember to run
- ⚠️ Two-step process

## Creating Migrations

### Step 1: Create Migration

```bash
# Create migration (schema only)
npx prisma migrate dev --name add_new_field

# Or create without applying (to edit SQL)
npx prisma migrate dev --name add_new_field --create-only
```

### Step 2: Add Data Migration (if needed)

**For simple transformations**, edit the generated SQL:

```sql
-- Add after schema changes, before DROP TABLE
UPDATE "new_AgentSession"
SET newField = 'default_value'
WHERE newField IS NULL;
```

**For complex logic**, create a script:

```bash
# Create script
touch scripts/migrate-<description>.ts

# Document in migration
echo "-- Run: tsx scripts/migrate-<description>.ts" >> migration.sql
```

### Step 3: Apply Migration

```bash
# Apply migration
npx prisma migrate dev

# If using script, run it after
tsx scripts/migrate-<description>.ts
```

## Deleting Migrations

**⚠️ IMPORTANT**: Never delete applied migrations in production!

**For development only**:

```bash
# 1. Remove from database
sqlite3 prisma/dev.db "DELETE FROM _prisma_migrations WHERE migration_name = '<migration_name>';"

# 2. Delete files
rm -rf prisma/migrations/<migration_name>

# 3. Verify
npx prisma migrate status
```

**If migration is already applied elsewhere**:

- ❌ Don't delete
- ✅ Create a new migration to revert changes

## Common Patterns

### Pattern 1: Add Field with Default

```sql
-- Auto-generated, no manual changes needed
ALTER TABLE "AgentSession" ADD COLUMN "newField" TEXT NOT NULL DEFAULT 'default';
```

### Pattern 2: Rename Field

```sql
-- In new table creation
CREATE TABLE "new_AgentSession" (
  "newName" TEXT NOT NULL,  -- renamed from oldName
  ...
);

-- In data copy
INSERT INTO "new_AgentSession" ("newName", ...)
SELECT "oldName", ... FROM "AgentSession";
```

### Pattern 3: Change Enum Values

```sql
-- Update existing data
UPDATE "new_AgentSession"
SET status = CASE
  WHEN status = 'old_value' THEN 'new_value'
  ELSE status
END;
```

### Pattern 4: Migrate Related Data

```typescript
// Use TypeScript script for complex joins
const sessions = await prisma.agentSession.findMany({
  include: { messages: true, repo: true },
});

for (const session of sessions) {
  // Complex logic involving multiple tables
}
```

## Best Practices

### DO ✅

- **Include data migration in SQL for simple transformations**
- **Test migrations on a copy of production data**
- **Document complex migrations in comments**
- **Use transactions for data safety**
- **Verify migration with `prisma migrate status`**

### DON'T ❌

- **Don't modify applied migrations**
- **Don't delete migrations that others have applied**
- **Don't skip testing migrations**
- **Don't forget to update related code**
- **Don't assume data is in expected state**

## Troubleshooting

### Migration History Mismatch

**Error**: "Migration X is missing from local migrations directory"

**Solution**:

```bash
# Option 1: Reset database (dev only)
npx prisma migrate reset

# Option 2: Remove from database
sqlite3 prisma/dev.db "DELETE FROM _prisma_migrations WHERE migration_name = 'X';"
```

### Migration Failed Midway

**Error**: Migration applied partially

**Solution**:

```bash
# 1. Check status
npx prisma migrate status

# 2. Mark as rolled back
sqlite3 prisma/dev.db "UPDATE _prisma_migrations SET rolled_back_at = CURRENT_TIMESTAMP WHERE migration_name = 'X';"

# 3. Fix migration SQL
# 4. Re-apply
npx prisma migrate dev
```

### Data Migration Script Failed

**Error**: Script failed after schema migration

**Solution**:

```bash
# 1. Fix script
# 2. Re-run script (idempotent!)
tsx scripts/migrate-<description>.ts

# 3. Verify data
sqlite3 prisma/dev.db "SELECT * FROM AgentSession LIMIT 5;"
```

## Examples from This Project

### Example 1: Add Resume Support (Schema Only)

**Migration**: `20251101024852_add_session_resume_support`

**Approach**: Schema only, data migration in script

**Files**:

- `migration.sql`: Schema changes
- `scripts/migrate-cancelled-to-suspended.ts`: Data migration

**Reason**: Initial implementation, separate script for flexibility

### Example 2: Simplify States (Schema + Data)

**Migration**: `20251101034240_simplify_session_states_to_4`

**Approach**: Schema + Data in SQL

**SQL**:

```sql
UPDATE AgentSession
SET status = CASE
  WHEN status = 'completed' THEN 'active'
  WHEN status = 'cancelled' THEN 'archived'
  ELSE status
END
WHERE status IN ('completed', 'cancelled');
```

**Reason**: Simple transformation, fits in SQL

## References

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [SQLite Pragma](https://www.sqlite.org/pragma.html)
- [Migration Best Practices](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
