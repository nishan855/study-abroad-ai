# StudyYatra Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** and **Docker Compose** (for local database)
- **PostgreSQL** >= 14 (if not using Docker)

## Initial Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, shared).

### 2. Start Database Services

Using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

To check if services are running:

```bash
docker-compose ps
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Your Claude API key from Anthropic
- `JWT_SECRET` - Generate a secure random string
- `NEXTAUTH_SECRET` - Generate a secure random string

For frontend, create `.env.local`:

```bash
cd frontend
cp .env.local.example .env.local
```

### 4. Set Up Database

Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client

### 5. Seed Database (Optional)

Seed with sample university data:

```bash
npm run db:seed
```

## Running the Application

### Development Mode

From the root directory:

```bash
npm run dev
```

This starts both:
- Frontend on http://localhost:3000
- Backend on http://localhost:4000

### Running Individually

Frontend only:
```bash
npm run dev:frontend
```

Backend only:
```bash
npm run dev:backend
```

## Database Management

### Prisma Studio

View and edit database records:

```bash
cd backend
npm run db:studio
```

Opens at http://localhost:5555

### Create a Migration

After changing the Prisma schema:

```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are in use:

1. Find and kill the process:
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:4000 | xargs kill -9
   ```

2. Or change ports in `.env`

### Database Connection Error

1. Check Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check DATABASE_URL in `.env` matches your setup

3. Restart containers:
   ```bash
   docker-compose restart
   ```

### Prisma Client Not Generated

```bash
cd backend
npx prisma generate
```

## Next Steps

- Review [API Documentation](./api.md)
- Review [Database Schema](./database.md)
- Start with Phase 2: Implementing chat API endpoints
