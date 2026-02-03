# Manual Startup Guide

Since the automated script requires sudo, here's a manual step-by-step process.

## Step 1: Start Docker Containers

Run this in your terminal (you'll be prompted for password):

```bash
sudo docker-compose up -d
```

**Expected output:**
```
Creating studyyatra-postgres ... done
Creating studyyatra-redis    ... done
Creating studyyatra-pgadmin  ... done
```

**Verify it worked:**
```bash
sudo docker ps
```

You should see 3 containers running.

---

## Step 2: Load Node.js 18

Make sure you're using Node 18:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node --version  # Should show v18.20.8
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This takes ~2-3 minutes. It installs:
- Frontend dependencies (Next.js, React, Tailwind)
- Backend dependencies (Express, Prisma, etc.)
- Shared types
- E2E tests

---

## Step 4: Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

This creates all 14 tables in your database.

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migration: init
```

---

## Step 5: Verify Database

Check if tables were created:

```bash
npx prisma studio
```

This opens http://localhost:5555 - you should see all 14 models!

---

## Step 6: Start Development Servers

```bash
cd ..
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:4000

---

## Access Your Services

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | After `npm run dev` |
| Backend API | http://localhost:4000 | After `npm run dev` |
| pgAdmin | http://localhost:5050 | Available now |
| Prisma Studio | http://localhost:5555 | Run `npx prisma studio` |

---

## Troubleshooting

### Docker won't start

```bash
# Check Docker is running
sudo systemctl status docker

# If not running, start it
sudo systemctl start docker
```

### npm install fails

```bash
# Make sure you're using Node 18
node --version  # Must be v18.x.x

# If wrong version:
nvm use 18
```

### Port already in use

```bash
# Find and kill process on port
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:4000 | xargs kill -9
```

### Migrations fail

```bash
# Make sure PostgreSQL is running
sudo docker ps | grep postgres

# Check .env has correct DATABASE_URL
cat .env | grep DATABASE_URL
# Should be: postgresql://studyyatra:studyyatra_dev@localhost:5432/studyyatra
```
