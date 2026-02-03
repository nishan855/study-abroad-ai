# Development Guide

## Project Structure

```
studyyatra/
├── frontend/              # Next.js application
├── backend/              # Express API server
├── shared/               # Shared TypeScript types
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Development Workflow

### 1. Feature Development

When implementing a new feature:

1. **Check the PRD** - Review the user story and acceptance criteria
2. **Create types** - Define TypeScript interfaces in `shared/types/`
3. **Backend first** - Implement API endpoints and business logic
4. **Frontend** - Build UI components and integrate with API
5. **Test** - Write E2E tests in `e2e/tests/`

### 2. Git Workflow

```bash
# Create feature branch
git checkout -b feature/chat-api

# Make changes and commit
git add .
git commit -m "feat: implement chat start endpoint"

# Push and create PR
git push origin feature/chat-api
```

### 3. Database Changes

When modifying the database schema:

1. Edit `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   npx prisma migrate dev --name <descriptive_name>
   ```
3. Update related TypeScript types in `shared/types/`
4. Regenerate Prisma Client if needed

## Code Style Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Define explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown
- Use interfaces for object shapes, types for unions

### Naming Conventions

- **Files**: kebab-case (`chat-controller.ts`)
- **Components**: PascalCase (`ChatContainer.tsx`)
- **Functions**: camelCase (`sendMessage()`)
- **Types**: PascalCase (`ChatMessage`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for props

Example:

```typescript
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  // Component logic
}
```

### API Endpoints

Follow REST conventions:

- `GET /api/resource` - List resources
- `GET /api/resource/:id` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/:id` - Update resource
- `DELETE /api/resource/:id` - Delete resource

### Error Handling

Backend:

```typescript
import { AppError, NotFoundError } from '../utils/errors'

// Throw typed errors
throw new NotFoundError('Conversation')

// Caught by error middleware
```

Frontend:

```typescript
try {
  await api.sendMessage(message)
} catch (error) {
  // Handle error appropriately
  console.error('Failed to send message:', error)
}
```

## Testing

### E2E Tests with Playwright

Located in `e2e/tests/`

Run tests:

```bash
npx playwright test
```

Example test:

```typescript
test('user can start a conversation', async ({ page }) => {
  await page.goto('http://localhost:3000/chat')
  await expect(page.getByTestId('chat-container')).toBeVisible()
})
```

### Manual Testing

1. Start development servers
2. Test API endpoints with Postman/Thunder Client
3. Test UI flows manually
4. Check browser console for errors

## Debugging

### Backend Debugging

Add breakpoints in VS Code:

1. Add to `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Backend",
     "program": "${workspaceFolder}/backend/src/index.ts",
     "runtimeExecutable": "tsx",
     "skipFiles": ["<node_internals>/**"]
   }
   ```

2. Set breakpoints and press F5

### Frontend Debugging

- Use React DevTools browser extension
- Use `console.log()` or debugger statements
- Check Network tab for API calls

### Database Debugging

Use Prisma Studio:

```bash
cd backend
npm run db:studio
```

## Performance Optimization

### Backend

- Use database indexes for frequently queried fields
- Implement Redis caching for expensive queries
- Use pagination for large datasets
- Monitor API response times

### Frontend

- Use Next.js Image component for images
- Implement lazy loading for heavy components
- Minimize bundle size
- Use React.memo for expensive renders

## Environment-Specific Configuration

### Development

- Hot reload enabled
- Detailed error messages
- Prisma Studio available
- CORS allows localhost

### Production

- Minified builds
- Generic error messages
- Database migrations run automatically
- CORS configured for production domain

## Common Tasks

### Add a New API Endpoint

1. Define types in `shared/types/api.ts`
2. Create route in `backend/src/routes/`
3. Create controller in `backend/src/controllers/`
4. Create service in `backend/src/services/`
5. Add to route index
6. Test endpoint

### Add a New Page

1. Create page in `frontend/app/`
2. Create components in `frontend/components/`
3. Create custom hooks if needed
4. Add types in `frontend/types/` or `shared/types/`
5. Test page

### Update Database Schema

1. Modify `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update seed data if needed
4. Update related types
