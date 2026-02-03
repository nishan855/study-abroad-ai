#!/bin/bash

# StudyYatra Setup Verification Script
# Checks if all required files and directories are in place

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}StudyYatra Setup Verification${NC}"
echo -e "${CYAN}========================================${NC}\n"

ERRORS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 ${RED}(missing)${NC}"
        ((ERRORS++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ ${RED}(missing)${NC}"
        ((ERRORS++))
    fi
}

# Function to check optional file
check_optional() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${YELLOW}○${NC} $1 ${YELLOW}(optional)${NC}"
        ((WARNINGS++))
    fi
}

echo -e "${CYAN}=== Root Configuration ===${NC}"
check_file "package.json"
check_file "README.md"
check_file ".gitignore"
check_file "docker-compose.yml"
check_file ".prettierrc"
check_optional ".env"
echo ""

echo -e "${CYAN}=== Frontend ===${NC}"
check_dir "frontend"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/next.config.js"
check_file "frontend/tailwind.config.ts"
check_file "frontend/postcss.config.js"
check_file "frontend/.eslintrc.json"
check_file "frontend/app/layout.tsx"
check_file "frontend/app/page.tsx"
check_file "frontend/app/globals.css"
check_optional "frontend/.env.local"
echo ""

echo -e "${CYAN}=== Frontend Directories ===${NC}"
check_dir "frontend/app"
check_dir "frontend/components"
check_dir "frontend/components/chat"
check_dir "frontend/components/results"
check_dir "frontend/components/university"
check_dir "frontend/components/common"
check_dir "frontend/hooks"
check_dir "frontend/lib"
check_dir "frontend/types"
check_dir "frontend/public"
echo ""

echo -e "${CYAN}=== Backend ===${NC}"
check_dir "backend"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/.eslintrc.json"
check_file "backend/src/index.ts"
check_file "backend/src/app.ts"
echo ""

echo -e "${CYAN}=== Backend Source Files ===${NC}"
check_file "backend/src/routes/index.ts"
check_file "backend/src/routes/chat.routes.ts"
check_file "backend/src/routes/university.routes.ts"
check_file "backend/src/routes/student.routes.ts"
check_file "backend/src/routes/auth.routes.ts"
check_file "backend/src/middleware/error.middleware.ts"
check_file "backend/src/utils/logger.ts"
check_file "backend/src/utils/errors.ts"
echo ""

echo -e "${CYAN}=== Backend Directories ===${NC}"
check_dir "backend/src/controllers"
check_dir "backend/src/services"
check_dir "backend/src/config"
check_dir "backend/src/prompts"
echo ""

echo -e "${CYAN}=== Database (Prisma) ===${NC}"
check_file "backend/prisma/schema.prisma"
check_dir "backend/prisma/migrations"
echo ""

echo -e "${CYAN}=== Shared Types ===${NC}"
check_dir "shared"
check_file "shared/package.json"
check_file "shared/types/index.ts"
check_file "shared/types/student.ts"
check_file "shared/types/chat.ts"
check_file "shared/types/university.ts"
check_file "shared/types/api.ts"
echo ""

echo -e "${CYAN}=== Documentation ===${NC}"
check_dir "docs"
check_file "docs/SETUP.md"
check_file "docs/DEVELOPMENT.md"
check_file "docs/DATABASE.md"
check_file "PROJECT_STATUS.md"
echo ""

echo -e "${CYAN}=== E2E Tests ===${NC}"
check_dir "e2e"
check_dir "e2e/tests"
echo ""

echo -e "${CYAN}=== Scripts ===${NC}"
check_dir "scripts"
check_file "scripts/verify-setup.sh"
echo ""

# Check Prisma schema syntax
echo -e "${CYAN}=== Prisma Schema Validation ===${NC}"
if [ -f "backend/prisma/schema.prisma" ]; then
    # Basic syntax check - look for required sections
    if grep -q "generator client" backend/prisma/schema.prisma && \
       grep -q "datasource db" backend/prisma/schema.prisma && \
       grep -q "model User" backend/prisma/schema.prisma; then
        echo -e "${GREEN}✓${NC} Prisma schema has required sections"
    else
        echo -e "${RED}✗${NC} Prisma schema missing required sections"
        ((ERRORS++))
    fi

    # Count models
    MODEL_COUNT=$(grep -c "^model " backend/prisma/schema.prisma || true)
    echo -e "${GREEN}✓${NC} Found $MODEL_COUNT models in schema"

    # Count enums
    ENUM_COUNT=$(grep -c "^enum " backend/prisma/schema.prisma || true)
    echo -e "${GREEN}✓${NC} Found $ENUM_COUNT enums in schema"
else
    echo -e "${RED}✗${NC} Prisma schema file not found"
    ((ERRORS++))
fi
echo ""

# Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Summary${NC}"
echo -e "${CYAN}========================================${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All required files and directories are in place!${NC}"
else
    echo -e "${RED}✗ Found $ERRORS missing required files/directories${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}○ $WARNINGS optional files not found (this is OK)${NC}"
fi

echo ""
echo -e "${CYAN}Next Steps:${NC}"
if [ ! -f ".env" ]; then
    echo -e "  1. Copy .env.example to .env and configure"
fi
echo -e "  2. Install Node.js >= 18.0.0"
echo -e "  3. Run: ${GREEN}npm install${NC}"
echo -e "  4. Run: ${GREEN}docker-compose up -d${NC}"
echo -e "  5. Run: ${GREEN}cd backend && npx prisma migrate dev${NC}"
echo -e "  6. Run: ${GREEN}npm run dev${NC}"

exit $ERRORS
