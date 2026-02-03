# Quick Start: View Database with pgAdmin

## Step 1: Start All Services

```bash
docker-compose up -d
```

This starts:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ **pgAdmin (port 5050)** ← Database GUI

## Step 2: Run Migrations

First time only - create the database tables:

```bash
cd backend
npx prisma migrate dev --name init
```

## Step 3: Open pgAdmin

Open your browser:
```
http://localhost:5050
```

**Login:**
- Email: `admin@studyyatra.local`
- Password: `admin`

## Step 4: Connect to Database

In pgAdmin:

1. **Right-click "Servers"** → Register → Server

2. **General tab:**
   - Name: `StudyYatra`

3. **Connection tab:**
   - Host: `postgres` ← Important! Use container name
   - Port: `5432`
   - Database: `studyyatra`
   - Username: `studyyatra`
   - Password: `studyyatra_dev`

4. Click **Save**

## Step 5: View Your Schema

Navigate to:
```
Servers → StudyYatra → Databases → studyyatra → Schemas → public → Tables
```

You'll see all 14 tables:
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

## View Table Structure

**Right-click any table** → Properties → Columns tab

You'll see all fields with:
- Data types
- Constraints (NOT NULL, UNIQUE, etc.)
- Default values
- Indexes

## View Relationships (ER Diagram)

**Right-click database** → ERD For Database

This shows a visual diagram of all tables and their relationships!

---

## Alternative: Prisma Studio (Easier!)

Even simpler than pgAdmin:

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555 - no configuration needed!

---

## Troubleshooting

**Can't connect?**

Make sure:
1. PostgreSQL is running: `docker ps | grep postgres`
2. Use hostname `postgres` not `localhost` in pgAdmin
3. Migrations are run: `cd backend && npx prisma migrate dev`

**pgAdmin not opening?**

```bash
# Check if running
docker ps | grep pgadmin

# View logs
docker logs studyyatra-pgadmin
```
