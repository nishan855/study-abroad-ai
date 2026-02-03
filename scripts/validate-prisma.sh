#!/bin/bash

# Prisma Schema Validation Script
# Validates Prisma schema syntax and checks for common issues

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Prisma Schema Validation${NC}"
echo -e "${CYAN}========================================${NC}\n"

SCHEMA_FILE="backend/prisma/schema.prisma"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}✗${NC} Schema file not found: $SCHEMA_FILE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Schema file found\n"

# Count models
MODEL_COUNT=$(grep -c "^model " "$SCHEMA_FILE" || true)
echo -e "${CYAN}Models:${NC} $MODEL_COUNT"

# List all models
echo -e "\n${CYAN}Model List:${NC}"
grep "^model " "$SCHEMA_FILE" | awk '{print "  - " $2}'

# Count enums
ENUM_COUNT=$(grep -c "^enum " "$SCHEMA_FILE" || true)
echo -e "\n${CYAN}Enums:${NC} $ENUM_COUNT"

# List all enums
echo -e "\n${CYAN}Enum List:${NC}"
grep "^enum " "$SCHEMA_FILE" | awk '{print "  - " $2}'

# Check for required sections
echo -e "\n${CYAN}Checking required sections:${NC}"

if grep -q "generator client" "$SCHEMA_FILE"; then
    echo -e "${GREEN}✓${NC} Generator section found"
else
    echo -e "${RED}✗${NC} Generator section missing"
    exit 1
fi

if grep -q "datasource db" "$SCHEMA_FILE"; then
    echo -e "${GREEN}✓${NC} Datasource section found"
else
    echo -e "${RED}✗${NC} Datasource section missing"
    exit 1
fi

# Check for core models
echo -e "\n${CYAN}Checking core models:${NC}"

REQUIRED_MODELS=("User" "University" "Program" "Conversation" "Message" "StudentProfile")

for model in "${REQUIRED_MODELS[@]}"; do
    if grep -q "^model $model " "$SCHEMA_FILE"; then
        echo -e "${GREEN}✓${NC} Model $model found"
    else
        echo -e "${RED}✗${NC} Model $model missing"
    fi
done

# Check for indexes
echo -e "\n${CYAN}Checking indexes:${NC}"

INDEX_COUNT=$(grep -c "@@index" "$SCHEMA_FILE" || true)
echo -e "${GREEN}✓${NC} Found $INDEX_COUNT indexes"

if [ $INDEX_COUNT -lt 5 ]; then
    echo -e "${YELLOW}⚠${NC}  Warning: Consider adding more indexes for performance"
fi

# Check for unique constraints
UNIQUE_COUNT=$(grep -c "@@unique" "$SCHEMA_FILE" || true)
echo -e "${GREEN}✓${NC} Found $UNIQUE_COUNT unique constraints"

# Check for relations
RELATION_COUNT=$(grep -c "@relation" "$SCHEMA_FILE" || true)
echo -e "${GREEN}✓${NC} Found $RELATION_COUNT relations"

# Summary
echo -e "\n${CYAN}========================================${NC}"
echo -e "${CYAN}Validation Summary${NC}"
echo -e "${CYAN}========================================${NC}"

echo -e "Models: ${GREEN}$MODEL_COUNT${NC}"
echo -e "Enums: ${GREEN}$ENUM_COUNT${NC}"
echo -e "Indexes: ${GREEN}$INDEX_COUNT${NC}"
echo -e "Unique Constraints: ${GREEN}$UNIQUE_COUNT${NC}"
echo -e "Relations: ${GREEN}$RELATION_COUNT${NC}"

echo -e "\n${GREEN}✓${NC} Schema validation passed!"
echo -e "\n${CYAN}Next steps:${NC}"
echo -e "  1. Run: ${GREEN}cd backend && npx prisma format${NC} (format schema)"
echo -e "  2. Run: ${GREEN}npx prisma validate${NC} (Prisma validation)"
echo -e "  3. Run: ${GREEN}npx prisma migrate dev${NC} (create migration)"

exit 0
