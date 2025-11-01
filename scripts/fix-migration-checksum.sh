#!/bin/bash
# Fix migration checksum after editing migration file
# Usage: ./scripts/fix-migration-checksum.sh <migration_name>

set -e

MIGRATION_NAME="${1:-20251101024852_add_session_resume_support}"
MIGRATION_FILE="prisma/migrations/$MIGRATION_NAME/migration.sql"
DB_FILE="prisma/dev.db"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

if [ ! -f "$DB_FILE" ]; then
  echo "❌ Database file not found: $DB_FILE"
  exit 1
fi

# Calculate new checksum
NEW_CHECKSUM=$(cat "$MIGRATION_FILE" | openssl dgst -sha256 -hex | cut -d' ' -f2)

echo "📝 Migration: $MIGRATION_NAME"
echo "🔢 New checksum: $NEW_CHECKSUM"

# Get old checksum
OLD_CHECKSUM=$(sqlite3 "$DB_FILE" "SELECT checksum FROM _prisma_migrations WHERE migration_name = '$MIGRATION_NAME';")

if [ -z "$OLD_CHECKSUM" ]; then
  echo "❌ Migration not found in database: $MIGRATION_NAME"
  exit 1
fi

echo "🔢 Old checksum: $OLD_CHECKSUM"

if [ "$OLD_CHECKSUM" = "$NEW_CHECKSUM" ]; then
  echo "✅ Checksum already matches, no update needed"
  exit 0
fi

# Update checksum
sqlite3 "$DB_FILE" "UPDATE _prisma_migrations SET checksum = '$NEW_CHECKSUM' WHERE migration_name = '$MIGRATION_NAME';"

echo "✅ Checksum updated successfully"

# Verify
VERIFY_CHECKSUM=$(sqlite3 "$DB_FILE" "SELECT checksum FROM _prisma_migrations WHERE migration_name = '$MIGRATION_NAME';")

if [ "$VERIFY_CHECKSUM" = "$NEW_CHECKSUM" ]; then
  echo "✅ Verification passed"
else
  echo "❌ Verification failed"
  exit 1
fi
