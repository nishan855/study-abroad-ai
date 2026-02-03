# How to Run StudyYatra - Complete Guide

## Current Status

✅ **Project Setup:** Complete (Phase 1 finished)
⚠️ **Prerequisites:** Need to install/configure
🔧 **Next Step:** Install prerequisites and start services

---

## Prerequisites Checklist

### 1. Docker Permissions ⚠️

**Issue:** Docker requires sudo or user in docker group

**Solution Option A - Add user to docker group (recommended):**
```bash
sudo usermod -aG docker $USER
newgrp docker
# Or logout and login again
```

**Solution Option B - Use sudo:**
```bash
sudo docker-compose up -d
```

**Verify Docker access:**
```bash
docker ps
# Should work without errors
```

### 2. Node.js Version ⚠️

**Current:** v12.22.9
**Required:** v18.0.0 or higher

**Install Node.js 18+ using nvm (recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

---

## Step-by-Step Launch

### Step 1: Fix Docker Permissions

```bash
# Add yourself to docker group
sudo usermod -aG docker $USER

# Apply changes (or logout/login)
newgrp docker

# Test
docker ps
```

### Step 2: Install Node.js 18+

```bash
# Using nvm
nvm install 18
nvm use 18

# Verify
node --version
```

### Step 3: Start Database Services

```bash
cd /home/nishan-practice/AI/study-abroad-ai

# Start PostgreSQL, Redis, and pgAdmin
docker-compose up -d

# Verify services are running
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                    STATUS          PORTS
xxxxx          postgres:15-alpine       Up 10 seconds   0.0.0.0:5432->5432/tcp
xxxxx          redis:7-alpine          Up 10 seconds   0.0.0.0:6379->6379/tcp
xxxxx          dpage/pgadmin4:latest   Up 10 seconds   0.0.0.0:5050->80/tcp
```

### Step 4: Install Project Dependencies

```bash
# Install all workspace dependencies
npm install
```

This installs dependencies for:
- Root workspace
- Frontend (Next.js)
- Backend (Express + Prisma)
- Shared types
- E2E tests

### Step 5: Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

**Required changes in .env:**
```env
# Add your Claude API key
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

# Generate secure secrets
JWT_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

**For frontend:**
```bash
cd frontend
cp .env.local.example .env.local
```

### Step 6: Run Database Migrations

```bash
cd backend

# Create database tables from Prisma schema
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration: 20260201_init
```

This creates all 14 tables in your database.

### Step 7: (Optional) Seed Database

```bash
# Still in backend directory
npm run db:seed
```

This will populate the database with sample universities and programs.

### Step 8: Start Development Servers

```bash
# From root directory
cd ..
npm run dev
```

This starts:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000

---

## Verification Checklist

### ✓ Check Services Running

```bash
# Database services
docker ps

# Should see 3 containers:
# - studyyatra-postgres (port 5432)
# - studyyatra-redis (port 6379)
# - studyyatra-pgadmin (port 5050)
```

### ✓ Check Database Connection

```bash
cd backend
npx tsx ../scripts/test-db-connection.ts
```

**Expected:** All tests pass ✓

### ✓ Check Database Schema (pgAdmin)

1. Open http://localhost:5050
2. Login:
   - Email: admin@studyyatra.local
   - Password: admin
3. Register server:
   - Host: `postgres`
   - Port: 5432
   - Database: studyyatra
   - Username: studyyatra
   - Password: studyyatra_dev
4. Navigate: Databases → studyyatra → Schemas → public → Tables
5. **Should see 14 tables!**

### ✓ Check Database Schema (Prisma Studio)

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

**Should see all 14 models in sidebar:**
- User
- StudentProfile
- TestScore
- University
- Program
- ProgramRequirements
- Scholarship
- Intake
- Conversation
- Message
- SavedUniversity
- Application
- ExchangeRate
- CountryInfo

### ✓ Check Frontend

Open http://localhost:3000

**Should see:**
- StudyYatra landing page
- "Start Your Journey" button
- Features section
- Tailwind styles applied

### ✓ Check Backend API

```bash
curl http://localhost:4000/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2026-02-01T..."}
```

---

## Quick Troubleshooting

### Docker permission denied

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port already in use

```bash
# Check what's using the port
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :3000  # Frontend
sudo lsof -i :4000  # Backend

# Stop conflicting service or change port in .env
```

### Database migration fails

```bash
# Make sure PostgreSQL is running
docker ps | grep postgres

# Check connection string in .env
cat .env | grep DATABASE_URL

# Should be:
# DATABASE_URL="postgresql://studyyatra:studyyatra_dev@localhost:5432/studyyatra"
```

### npm install fails

```bash
# Check Node version
node --version  # Must be >= 18.0.0

# If wrong version, install Node 18
nvm install 18
nvm use 18
```

---

## What You Can Access

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | None |
| **Backend API** | http://localhost:4000 | None |
| **pgAdmin** | http://localhost:5050 | admin@studyyatra.local / admin |
| **Prisma Studio** | http://localhost:5555 | None |
| **PostgreSQL** | localhost:5432 | studyyatra / studyyatra_dev |
| **Redis** | localhost:6379 | None |

---

## Current Blockers

1. ⚠️ **Docker permissions** - Need to add user to docker group or use sudo
2. ⚠️ **Node.js version** - Need v18+, currently have v12.22.9

**Once these are fixed, everything is ready to run!**

---

## Next Steps After Setup

1. ✅ All services running
2. ✅ Database migrated and verified
3. 🚀 **Start Phase 2:** Implement Backend APIs
   - Chat API (Claude integration)
   - University matching algorithm
   - Search and filter endpoints

---

## Summary

**Phase 1:** ✅ Complete (Project setup, database schema, types, tests)
**Current:** ⚠️ Prerequisites needed (Docker permissions, Node 18+)
**Next:** 🚀 Phase 2 implementation (Backend API)

**Total time to get running:** ~15-30 minutes (after prerequisites)
