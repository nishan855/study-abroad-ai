# StudyYatra

AI-Powered Study Abroad Counselor for Nepali Students

## Overview

StudyYatra helps Nepali students find the perfect university abroad through an intelligent conversational AI interface. The platform matches students with verified universities based on their profile, budget, and career goals.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude API (Anthropic)
- **Cache**: Redis
- **Hosting**: Vercel (frontend), Railway/Render (backend)

## Project Structure

```
studyyatra/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── shared/            # Shared types
├── e2e/              # Playwright tests
└── scripts/          # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

The frontend will run on http://localhost:3000 and the backend on http://localhost:4000.

## Development

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all workspaces
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## License

Proprietary
