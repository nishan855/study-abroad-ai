# 🚀 START HERE - Launch StudyYatra

## What's Ready

✅ **Node.js 18.20.8 installed**
✅ **npm 10.8.2 installed**
✅ **Project fully configured**
✅ **Docker Compose ready**

## Quick Start (2 commands)

### 1. Run the startup script

```bash
cd /home/nishan-practice/AI/study-abroad-ai
./start.sh
```

This will:
- Start PostgreSQL, Redis, and pgAdmin containers
- Install all npm dependencies
- Run database migrations
- Set up your database schema

### 2. Start the development servers

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:4000

---

## That's It!

Once running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | StudyYatra web app |
| **Backend API** | http://localhost:4000 | API server |
| **pgAdmin** | http://localhost:5050 | View database schema |
| **Prisma Studio** | http://localhost:5555 | Browse database (run `cd backend && npx prisma studio`) |

---

## pgAdmin Login

To view your database schema in pgAdmin:

1. Open http://localhost:5050
2. Login:
   - Email: `admin@studyyatra.local`
   - Password: `admin`
3. Register server:
   - **General tab:** Name = `StudyYatra`
   - **Connection tab:**
     - Host: `postgres`
     - Port: `5432`
     - Database: `studyyatra`
     - Username: `studyyatra`
     - Password: `studyyatra_dev`
4. View tables: Databases → studyyatra → Schemas → public → Tables

You'll see all 14 tables!

---

## Don't Forget!

**Add your Claude API key:**

```bash
nano .env
# Change: ANTHROPIC_API_KEY="sk-ant-..."
```

Get your API key from: https://console.anthropic.com/

---

## Troubleshooting

### Script fails with "permission denied"

```bash
chmod +x start.sh
./start.sh
```

### Docker permission error

```bash
sudo usermod -aG docker $USER
newgrp docker
./start.sh
```

### Port already in use

```bash
# Stop any existing services
sudo docker-compose down
sudo lsof -ti:3000 | xargs kill -9  # Frontend
sudo lsof -ti:4000 | xargs kill -9  # Backend

# Then restart
./start.sh
```

---

## What You Have

📁 **47 files** created
🗄️ **14 database models** ready
📝 **6 type contracts** implemented
🧪 **33+ E2E tests** written
📚 **Complete documentation**

**Phase 1:** ✅ Complete
**Ready for:** Phase 2 - Backend API Implementation

---

## Next Steps After Running

1. ✅ Services running
2. 📝 Add Claude API key to `.env`
3. 🌐 Open http://localhost:3000
4. 🚀 Start building Phase 2 features!

---

**Need help?** Check:
- [RUN_GUIDE.md](RUN_GUIDE.md) - Detailed setup guide
- [docs/SETUP.md](docs/SETUP.md) - Installation reference
- [QUICK_START_PGADMIN.md](QUICK_START_PGADMIN.md) - pgAdmin quick start
