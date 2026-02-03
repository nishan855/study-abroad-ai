# Database Visualization & Management Tools

This guide shows you how to visualize and manage your StudyYatra database using different tools.

## Table of Contents
1. [pgAdmin (Web-based GUI)](#pgadmin)
2. [Prisma Studio (Recommended)](#prisma-studio)
3. [Command Line (psql)](#command-line)

---

## pgAdmin

pgAdmin is a powerful PostgreSQL management tool with a full GUI for exploring schemas, running queries, and managing databases.

### Setup

#### 1. Start pgAdmin with Docker Compose

pgAdmin is already configured in `docker-compose.yml`. Start all services:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port **5432**
- Redis on port **6379**
- **pgAdmin on port 5050** ← New!

#### 2. Access pgAdmin

Open your browser and go to:
```
http://localhost:5050
```

**Login credentials:**
- Email: `admin@studyyatra.local`
- Password: `admin`

> ⚠️ **Note:** These are development credentials. Change them in production!

#### 3. Connect to PostgreSQL Database

Once logged into pgAdmin:

1. **Right-click "Servers"** in the left sidebar
2. **Select "Register" → "Server"**

**General Tab:**
- Name: `StudyYatra Local`

**Connection Tab:**
- Host name/address: `postgres` (use container name, not `localhost`)
- Port: `5432`
- Maintenance database: `studyyatra`
- Username: `studyyatra`
- Password: `studyyatra_dev`

**Advanced Tab (Optional):**
- DB restriction: `studyyatra` (only show this database)

Click **Save**.

#### 4. View Database Schema

After connecting:

1. **Expand the server:** StudyYatra Local
2. **Expand:** Databases → studyyatra → Schemas → public → Tables

You should see all your tables:
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
- _prisma_migrations (Prisma metadata)

#### 5. Explore Table Structure

**To view a table's schema:**
1. Right-click on a table (e.g., `University`)
2. Select **Properties**
3. Go to **Columns** tab to see all fields, types, and constraints

**To view data:**
1. Right-click on a table
2. Select **View/Edit Data** → **All Rows**

**To run custom queries:**
1. Click **Tools** → **Query Tool**
2. Write SQL and click **Execute** (▶️)

Example query:
```sql
SELECT * FROM "University" LIMIT 10;
```

#### 6. View Relationships (ER Diagram)

1. Right-click on **studyyatra** database
2. Select **ERD For Database**
3. This shows a visual diagram of all tables and their relationships

---

## Prisma Studio

**✨ RECOMMENDED** - Easiest way to view and edit data!

Prisma Studio is a visual database browser built into Prisma. It's perfect for:
- Quick data viewing
- Easy record editing
- No configuration needed
- Works directly with your Prisma schema

### Setup

#### 1. Make sure database is running

```bash
docker-compose up -d postgres
```

#### 2. Run Prisma Studio

```bash
cd backend
npm run db:studio
```

Or directly:
```bash
npx prisma studio
```

#### 3. Access Prisma Studio

Automatically opens in your browser at:
```
http://localhost:5555
```

### Features

- **All models** displayed on the left sidebar
- **Click any model** to view records
- **Add records** with the "Add record" button
- **Edit records** by clicking on fields
- **Delete records** with delete button
- **Filter and search** data easily
- **See relationships** between records

### Advantages over pgAdmin

| Feature | Prisma Studio | pgAdmin |
|---------|--------------|---------|
| Setup time | None (just run) | Manual connection |
| Schema awareness | Reads from Prisma schema | Reads from DB |
| Ease of use | Very easy | More complex |
| Data editing | Very intuitive | More technical |
| Relationships | Shows clearly | Manual FK lookup |
| Raw SQL | No | Yes |

**Recommendation:** Use Prisma Studio for quick data viewing/editing, pgAdmin for complex queries and schema analysis.

---

## Command Line (psql)

For advanced users who prefer the terminal.

### Connect to PostgreSQL

#### Using Docker exec

```bash
docker exec -it studyyatra-postgres psql -U studyyatra -d studyyatra
```

#### Using psql client (if installed locally)

```bash
psql -h localhost -U studyyatra -d studyyatra
```

Password: `studyyatra_dev`

### Useful Commands

**List all tables:**
```sql
\dt
```

**Describe a table:**
```sql
\d "University"
```

**View all schemas:**
```sql
\dn
```

**List all databases:**
```sql
\l
```

**Execute a query:**
```sql
SELECT * FROM "University" LIMIT 5;
```

**Show table with relationships:**
```sql
\d+ "Program"
```

**Count records:**
```sql
SELECT COUNT(*) FROM "University";
```

**Exit psql:**
```sql
\q
```

---

## Common Tasks

### Task 1: View All Tables After Migration

**Using Prisma Studio:**
```bash
cd backend
npx prisma studio
```
→ All models appear in left sidebar

**Using pgAdmin:**
1. Connect to server
2. Navigate to: Databases → studyyatra → Schemas → public → Tables

**Using psql:**
```bash
docker exec -it studyyatra-postgres psql -U studyyatra -d studyyatra -c '\dt'
```

### Task 2: Check If Migrations Ran Successfully

**Check migration history:**
```bash
cd backend
npx prisma migrate status
```

**View applied migrations in database:**
```sql
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

### Task 3: View Sample Data

**Using Prisma Studio:**
1. Open http://localhost:5555
2. Click "University" in sidebar
3. See all universities

**Using pgAdmin:**
1. Right-click "University" table
2. View/Edit Data → All Rows

**Using psql:**
```sql
SELECT id, name, country, city FROM "University" LIMIT 10;
```

### Task 4: Check Indexes

**Using pgAdmin:**
1. Expand table → Indexes
2. See all indexes with details

**Using psql:**
```sql
\d+ "Program"
```
Indexes are listed at the bottom.

### Task 5: Verify Foreign Keys

**Using Prisma Studio:**
- Relations show automatically when viewing records

**Using pgAdmin:**
1. Table → Properties → Constraints
2. See all foreign keys

**Using psql:**
```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'Program';
```

---

## Troubleshooting

### Cannot connect to pgAdmin

**Error:** "Unable to connect to server"

**Solution:**
```bash
# Check if pgAdmin is running
docker ps | grep pgadmin

# If not running, start it
docker-compose up -d pgadmin

# Check logs
docker logs studyyatra-pgadmin
```

### Cannot connect pgAdmin to PostgreSQL

**Error:** "could not connect to server"

**Solution:**
- Make sure you use hostname `postgres` (container name), not `localhost`
- Verify PostgreSQL is running: `docker ps | grep postgres`
- Check credentials match .env file

### Prisma Studio shows "Can't reach database"

**Error:** "Can't reach database server"

**Solution:**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Should be:
# DATABASE_URL="postgresql://studyyatra:studyyatra_dev@localhost:5432/studyyatra"

# Make sure PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it studyyatra-postgres pg_isready -U studyyatra
```

### Tables don't appear in pgAdmin

**Issue:** Database is empty

**Solution:**
```bash
# Run migrations first
cd backend
npx prisma migrate dev --name init

# Then refresh pgAdmin (right-click database → Refresh)
```

---

## Quick Reference

| Tool | URL | Use Case |
|------|-----|----------|
| **Prisma Studio** | http://localhost:5555 | Quick data viewing/editing |
| **pgAdmin** | http://localhost:5050 | Schema analysis, complex queries |
| **PostgreSQL Direct** | localhost:5432 | Application connections |

### Default Credentials

**PostgreSQL:**
- User: `studyyatra`
- Password: `studyyatra_dev`
- Database: `studyyatra`
- Port: `5432`

**pgAdmin:**
- Email: `admin@studyyatra.local`
- Password: `admin`
- Port: `5050`

**Prisma Studio:**
- No credentials needed
- Port: `5555`

---

## Next Steps

1. **Start services:** `docker-compose up -d`
2. **Run migrations:** `cd backend && npx prisma migrate dev`
3. **Open Prisma Studio:** `npx prisma studio`
4. **Or open pgAdmin:** http://localhost:5050

Choose the tool that fits your workflow best!
