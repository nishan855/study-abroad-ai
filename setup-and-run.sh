#!/bin/bash

# Complete Setup and Run Script for StudyYatra
# Run this with: ./setup-and-run.sh

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  StudyYatra - Complete Setup & Run    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify Node version
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
echo -e "${GREEN}✓${NC} npm: $NPM_VERSION\n"

if [[ "$NODE_VERSION" != v18* ]] && [[ "$NODE_VERSION" != v20* ]]; then
    echo -e "${RED}✗${NC} Node.js version must be 18 or higher"
    echo -e "  Current: $NODE_VERSION"
    echo -e "  Run: nvm install 18 && nvm use 18"
    exit 1
fi

# Step 1: Start Docker containers
echo -e "${CYAN}[1/6] Starting Docker containers...${NC}"
echo -e "${YELLOW}→${NC} You may be prompted for sudo password\n"

sudo docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Failed to start Docker containers"
    echo -e "  Try: sudo systemctl start docker"
    exit 1
fi

echo -e "\n${GREEN}✓${NC} Docker containers started\n"

# Wait for PostgreSQL to be ready
echo -e "${CYAN}[2/6] Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check container status
echo -e "\n${CYAN}Container Status:${NC}"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep studyyatra

# Step 2: Install npm dependencies
echo -e "\n${CYAN}[3/6] Installing npm dependencies...${NC}"
echo -e "${YELLOW}→${NC} This may take 2-3 minutes\n"

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} npm install failed"
    exit 1
fi

echo -e "\n${GREEN}✓${NC} Dependencies installed\n"

# Step 3: Create .env if it doesn't exist
echo -e "${CYAN}[4/6] Setting up environment...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
    echo -e "${YELLOW}⚠${NC}  Don't forget to add your ANTHROPIC_API_KEY to .env\n"
else
    echo -e "${GREEN}✓${NC} .env file exists\n"
fi

# Step 4: Run database migrations
echo -e "${CYAN}[5/6] Running database migrations...${NC}"

cd backend

npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Database migration failed"
    echo -e "  Check if PostgreSQL is running: sudo docker ps | grep postgres"
    exit 1
fi

echo -e "\n${GREEN}✓${NC} Database tables created (14 models)\n"

cd ..

# Step 5: Verify everything
echo -e "${CYAN}[6/6] Verifying setup...${NC}\n"

# Check Docker containers
CONTAINERS=$(sudo docker ps --filter "name=studyyatra" --format "{{.Names}}" | wc -l)

if [ "$CONTAINERS" -eq 3 ]; then
    echo -e "${GREEN}✓${NC} All 3 Docker containers running"
else
    echo -e "${YELLOW}⚠${NC}  Expected 3 containers, found $CONTAINERS"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}✗${NC} node_modules not found"
fi

# Check if migrations ran
if sudo docker exec studyyatra-postgres psql -U studyyatra -d studyyatra -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | grep -q "14"; then
    echo -e "${GREEN}✓${NC} Database has 14 tables"
else
    echo -e "${YELLOW}⚠${NC}  Database table count might be different"
fi

echo -e "\n${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          Setup Complete! 🎉             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Your services are ready:${NC}\n"

echo -e "  ${CYAN}Database Services:${NC}"
echo -e "    • PostgreSQL:    localhost:5432"
echo -e "    • Redis:         localhost:6379"
echo -e "    • pgAdmin:       ${GREEN}http://localhost:5050${NC}"
echo -e "      Login: admin@studyyatra.local / admin\n"

echo -e "  ${CYAN}Development Servers (run 'npm run dev'):${NC}"
echo -e "    • Frontend:      ${GREEN}http://localhost:3000${NC}"
echo -e "    • Backend API:   ${GREEN}http://localhost:4000${NC}\n"

echo -e "  ${CYAN}Database Tools:${NC}"
echo -e "    • Prisma Studio: ${GREEN}http://localhost:5555${NC}"
echo -e "      Run: cd backend && npx prisma studio\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Edit .env and add your ANTHROPIC_API_KEY"
echo -e "  2. Run: ${GREEN}npm run dev${NC}"
echo -e "  3. Visit: ${GREEN}http://localhost:3000${NC}\n"

echo -e "${CYAN}Quick commands:${NC}"
echo -e "  npm run dev          ${YELLOW}#${NC} Start frontend and backend"
echo -e "  sudo docker ps       ${YELLOW}#${NC} Check Docker containers"
echo -e "  sudo docker-compose logs ${YELLOW}#${NC} View container logs"
echo -e "  cd backend && npx prisma studio ${YELLOW}#${NC} View database\n"

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "Run ${GREEN}npm run dev${NC} to start the application.\n"
