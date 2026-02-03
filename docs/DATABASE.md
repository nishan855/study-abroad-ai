# Database Documentation

## Overview

StudyYatra uses PostgreSQL with Prisma ORM for type-safe database access.

## Schema Overview

### Core Models

#### User
Stores user authentication and profile information.

#### StudentProfile
Detailed student information collected through the chat conversation.

#### University & Program
University and program catalog with verified information.

#### Conversation & Message
Chat conversation history and AI responses.

### Data Models Diagram

```
User (1) ---- (1) StudentProfile
  |
  ├── (many) Conversations
  ├── (many) SavedUniversities
  └── (many) Applications

University (1) ---- (many) Programs
  |
  └── Program (1) ---- (1) ProgramRequirements
         |
         ├── (many) Scholarships
         └── (many) Intakes

Conversation (1) ---- (many) Messages
```

## Key Tables

### universities

Stores university information.

**Key fields:**
- `name` - University name
- `country` - Country enum
- `slug` - URL-friendly identifier
- `isRegional` - For Australian regional university bonus points

**Indexes:**
- `country` - Fast filtering by country
- `name` - Full-text search

### programs

Stores program/course information.

**Key fields:**
- `name` - Program name (e.g., "Master of Business Administration")
- `level` - BACHELORS, MASTERS, MBA, PHD, DIPLOMA
- `field` - IT, BUSINESS, ENGINEERING, etc.
- `tuitionNPR` - Pre-calculated tuition in NPR for easy filtering
- `prPathway` - PR pathway strength rating

**Indexes:**
- `field` - Filter by field of study
- `level` - Filter by study level
- `tuitionNPR` - Fast budget filtering
- `prPathway` - Filter by PR pathway strength

### conversations

Stores chat conversation state.

**Key fields:**
- `sessionId` - Unique session for anonymous users
- `stage` - Current conversation stage (enum)
- `extractedProfile` - JSON field with extracted student data
- `matchedProgramIds` - Array of matched program IDs

**Indexes:**
- `sessionId` - Fast session lookup
- `userId` - User's conversations

## Enums

### StudyLevel
- BACHELORS
- MASTERS
- MBA
- PHD
- DIPLOMA
- CERTIFICATE

### FieldOfStudy
- IT
- BUSINESS
- ENGINEERING
- HEALTHCARE
- ARTS
- SCIENCE
- LAW
- OTHER

### Country
- CANADA
- AUSTRALIA
- UK
- USA
- GERMANY
- JAPAN
- NEW_ZEALAND
- IRELAND

### ConversationStage
- GREETING
- STUDY_LEVEL
- FIELD
- EDUCATION
- PERCENTAGE
- WORK_EXPERIENCE
- TESTS
- TEST_SCORES
- CAREER_GOAL
- BUDGET
- LOAN_WILLINGNESS
- COUNTRIES
- TIMELINE
- COMPLETE

## JSON Fields

### Conversation.extractedProfile

Stores partially extracted student profile:

```json
{
  "studyLevel": "MASTERS",
  "fieldOfStudy": "IT",
  "percentage": 68,
  "tests": {
    "type": "IELTS",
    "overallScore": 6.5
  },
  "budgetNPR": 3000000
}
```

### Application.documentsChecklist

Tracks application document preparation:

```json
{
  "transcripts": true,
  "sop": true,
  "lors": false,
  "resume": true,
  "passport": true
}
```

## Data Integrity

### Cascade Deletes

- Delete User → Deletes StudentProfile, Conversations
- Delete University → Deletes Programs
- Delete Program → Deletes Requirements, Scholarships, Intakes
- Delete Conversation → Deletes Messages

### Unique Constraints

- User email (when provided)
- User phone (when provided)
- University slug
- Program slug within university
- TestScore (profileId + testType)
- SavedUniversity (userId + programId)
- Application (userId + programId)

## Queries & Performance

### Common Queries

**Find programs by student profile:**
```typescript
const programs = await prisma.program.findMany({
  where: {
    level: profile.studyLevel,
    field: profile.fieldOfStudy,
    tuitionNPR: { lte: profile.budgetNPR },
    requirements: {
      ieltsMin: { lte: profile.tests.overallScore }
    }
  },
  include: {
    university: true,
    requirements: true,
    scholarships: true
  },
  take: 5
})
```

**Get conversation with messages:**
```typescript
const conversation = await prisma.conversation.findUnique({
  where: { sessionId },
  include: {
    messages: {
      orderBy: { createdAt: 'asc' }
    }
  }
})
```

### Optimization Tips

1. Use `select` to fetch only needed fields
2. Use `include` carefully - avoid deep nesting
3. Add indexes for frequently filtered fields
4. Use pagination with `skip` and `take`
5. Cache expensive queries in Redis

## Migrations

### Creating Migrations

```bash
npx prisma migrate dev --name <descriptive_name>
```

Examples:
- `add_scholarship_table`
- `add_pr_pathway_to_programs`
- `update_conversation_stages`

### Migration Files

Located in: `backend/prisma/migrations/`

### Rolling Back

Prisma doesn't support automatic rollback. To roll back:

1. Delete the migration folder
2. Restore from database backup
3. Or manually write down migration

## Seeding

Seed file: `backend/prisma/seed.ts`

Run seed:
```bash
npm run db:seed
```

Seed data includes:
- Sample universities (50+)
- Sample programs (100+)
- Exchange rates
- Country information

## Backup & Restore

### Backup

```bash
pg_dump -U studyyatra studyyatra > backup.sql
```

### Restore

```bash
psql -U studyyatra studyyatra < backup.sql
```

## Monitoring

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

### Query Logging

Enable in development:

```typescript
// In database.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})
```
