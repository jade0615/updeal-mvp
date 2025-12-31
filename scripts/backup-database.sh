#!/bin/bash

# ==========================================
# Supabase Database Backup Script
# ==========================================
# Purpose: Create a backup of the Supabase database before migrations
# Usage: ./backup-database.sh

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://postgres.vlnhnvanfzbgfnxqksln:hsKyXiNCxrP09CI4@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================="
echo "Supabase Database Backup Script"
echo -e "==========================================${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump is not installed${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${YELLOW}Creating database backup...${NC}"
echo "Timestamp: $TIMESTAMP"
echo ""

# Full database backup
FULL_BACKUP_FILE="$BACKUP_DIR/full_backup_$TIMESTAMP.sql"
echo -e "${YELLOW}1. Creating full database backup...${NC}"
pg_dump "$DATABASE_URL" > "$FULL_BACKUP_FILE"
echo -e "${GREEN}✓ Full backup saved to: $FULL_BACKUP_FILE${NC}"
echo ""

# Coupons table backup (schema + data)
COUPONS_BACKUP_FILE="$BACKUP_DIR/coupons_backup_$TIMESTAMP.sql"
echo -e "${YELLOW}2. Creating coupons table backup...${NC}"
pg_dump "$DATABASE_URL" -t coupons > "$COUPONS_BACKUP_FILE"
echo -e "${GREEN}✓ Coupons backup saved to: $COUPONS_BACKUP_FILE${NC}"
echo ""

# Coupons data export to CSV
COUPONS_CSV_FILE="$BACKUP_DIR/coupons_data_$TIMESTAMP.csv"
echo -e "${YELLOW}3. Exporting coupons data to CSV...${NC}"
psql "$DATABASE_URL" -c "\COPY coupons TO '$COUPONS_CSV_FILE' CSV HEADER"
echo -e "${GREEN}✓ Coupons CSV saved to: $COUPONS_CSV_FILE${NC}"
echo ""

# Get backup file sizes
FULL_SIZE=$(du -h "$FULL_BACKUP_FILE" | cut -f1)
COUPONS_SIZE=$(du -h "$COUPONS_BACKUP_FILE" | cut -f1)
CSV_SIZE=$(du -h "$COUPONS_CSV_FILE" | cut -f1)

# Summary
echo -e "${GREEN}=========================================="
echo "Backup Complete!"
echo -e "==========================================${NC}"
echo ""
echo "Backup files created:"
echo "  1. Full database:    $FULL_BACKUP_FILE ($FULL_SIZE)"
echo "  2. Coupons table:    $COUPONS_BACKUP_FILE ($COUPONS_SIZE)"
echo "  3. Coupons CSV:      $COUPONS_CSV_FILE ($CSV_SIZE)"
echo ""
echo -e "${GREEN}✓ All backups completed successfully!${NC}"
echo ""
echo "To restore from backup:"
echo "  psql \"\$DATABASE_URL\" < $FULL_BACKUP_FILE"
echo ""
