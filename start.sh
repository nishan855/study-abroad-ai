#!/bin/bash

# StudyYatra Startup Script
# This script starts all services and sets up the database

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}StudyYatra - Starting Services${NC}"
echo -e "${CYAN}========================================${NC}\n"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify Node version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
echo -e "${GREEN}✓${NC} npm: $(npm --version)\n"

# Step 1: Start Docker containers
echo -e "${CYAN}Step 1: Starting Docker containers...${NC}"
sudo docker-compose up -d

echo ""
echo -e "${GREEN}✓${NC} Waiting for services to be ready..."
sleep 5

# Check if containers are running
echo ""
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${CYAN}Step 2: Installing npm dependencies...${NC}"
npm install

echo ""
echo -e "${CYAN}Step 3: Setting up database...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠${NC}  .env file not found. Creating from template..."
    cp .env.example .env
    echo -e "${RED}⚠${NC}  Please edit .env and add your ANTHROPIC_API_KEY"
fi

cd backend

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Services Started!${NC}"
echo -e "${CYAN}========================================${NC}\n"

echo -e "Access your services:"
echo -e "  ${GREEN}Frontend:${NC}      http://localhost:3000 (run 'npm run dev')"
echo -e "  ${GREEN}Backend API:${NC}   http://localhost:4000 (run 'npm run dev')"
echo -e "  ${GREEN}pgAdmin:${NC}       http://localhost:5050"
echo -e "  ${GREEN}Prisma Studio:${NC} http://localhost:5555 (run 'npx prisma studio')"

echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Edit .env file and add your Claude API key"
echo -e "  2. Run: ${GREEN}npm run dev${NC} (to start frontend and backend)"
echo -e "  3. Open: ${GREEN}http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
