#!/bin/bash

# Setup script for using local PostgreSQL instead of Docker

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  StudyYatra - Local Database Setup    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
echo -e "${GREEN}✓${NC} npm: $(npm --version)\n"

# Check if PostgreSQL is running locally
echo -e "${CYAN}[1/5] Checking local PostgreSQL...${NC}"

if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL client found"

    # Try to connect
    if psql -U postgres -c "SELECT version();" &> /dev/null || psql -U $USER -c "SELECT version();" &> /dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running locally\n"
    else
        echo -e "${YELLOW}⚠${NC}  PostgreSQL found but cannot connect"
        echo -e "  You may need to start it: sudo systemctl start postgresql\n"
    fi
else
    echo -e "${YELLOW}⚠${NC}  PostgreSQL client not found"
    echo -e "  Install: sudo apt install postgresql-client\n"
fi

# Create database
echo -e "${CYAN}[2/5] Creating StudyYatra database...${NC}"
echo -e "${YELLOW}→${NC} You may be prompted for PostgreSQL password\n"

# Try different methods to create database
sudo -u postgres psql -c "CREATE DATABASE studyyatra;" 2>/dev/null || \
psql -U postgres -c "CREATE DATABASE studyyatra;" 2>/dev/null || \
createdb studyyatra 2>/dev/null || \
echo -e "${YELLOW}⚠${NC}  Database might already exist (this is OK)\n"

# Create user if needed
sudo -u postgres psql -c "CREATE USER studyyatra WITH PASSWORD 'studyyatra_dev';" 2>/dev/null || \
psql -U postgres -c "CREATE USER studyyatra WITH PASSWORD 'studyyatra_dev';" 2>/dev/null || \
echo -e "${YELLOW}⚠${NC}  User might already exist (this is OK)\n"

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE studyyatra TO studyyatra;" 2>/dev/null || \
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE studyyatra TO studyyatra;" 2>/dev/null || \
echo ""

echo -e "${GREEN}✓${NC} Database ready\n"

# Update .env for local PostgreSQL
echo -e "${CYAN}[3/5] Configuring environment...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Update DATABASE_URL in .env to use local PostgreSQL
sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://studyyatra:studyyatra_dev@localhost:5432/studyyatra"|g' .env

# Update REDIS_URL for local Redis
sed -i 's|REDIS_URL=.*|REDIS_URL="redis://localhost:6379"|g' .env

echo -e "${GREEN}✓${NC} .env configured for local databases\n"
echo -e "${YELLOW}⚠${NC}  Don't forget to add your ANTHROPIC_API_KEY to .env\n"

# Install dependencies
echo -e "${CYAN}[4/5] Installing npm dependencies...${NC}"
echo -e "${YELLOW}→${NC} This may take 2-3 minutes\n"

npm install

echo -e "\n${GREEN}✓${NC} Dependencies installed\n"

# Run migrations
echo -e "${CYAN}[5/5] Running database migrations...${NC}\n"

cd backend
npx prisma migrate dev --name init

echo -e "\n${GREEN}✓${NC} Database tables created (14 models)\n"

cd ..

# Summary
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Setup Complete! 🎉              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Using local databases:${NC}"
echo -e "  • PostgreSQL: localhost:5432 (existing)"
echo -e "  • Redis:      localhost:6379 (existing)\n"

echo -e "${GREEN}Start pgAdmin separately if needed:${NC}"
echo -e "  sudo docker run -d \\"
echo -e "    -p 5050:80 \\"
echo -e "    -e PGADMIN_DEFAULT_EMAIL=admin@studyyatra.local \\"
echo -e "    -e PGADMIN_DEFAULT_PASSWORD=admin \\"
echo -e "    dpage/pgadmin4\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Edit .env and add your ANTHROPIC_API_KEY"
echo -e "  2. Run: ${GREEN}npm run dev${NC}"
echo -e "  3. Visit: ${GREEN}http://localhost:3000${NC}\n"

echo -e "${CYAN}Quick commands:${NC}"
echo -e "  npm run dev                  ${YELLOW}#${NC} Start frontend and backend"
echo -e "  cd backend && npx prisma studio ${YELLOW}#${NC} View database (http://localhost:5555)\n"

echo -e "${GREEN}Setup completed successfully!${NC}\n"
