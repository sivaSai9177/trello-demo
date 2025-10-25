# @trello-demo/shared

Shared TypeScript types between frontend and backend - **automatically synced with database schema**.

## Why This Package?

This package solves two critical problems:

1. **No Brittle Imports**: Avoids fragile relative imports like `../../../backend/src/types`
2. **Auto-Sync with Database**: Types are automatically inferred from Drizzle schema, preventing type drift

## How It Works

```
Database Schema (backend/src/db/schema.ts)
    ↓
Drizzle InferSelectModel
    ↓
Auto-generated Types (backend/src/db/schema-types.ts)
    ↓
Re-exported via Shared Package (shared/types.ts)
    ↓
Used in Frontend & Backend
```

## Usage

Both frontend and backend import from the shared package:

```typescript
// In frontend or backend:
import type { Project, Task, Comment } from "@trello-demo/shared";

const project: Project = {
  id: 1,
  name: "My Project",
  description: "Description",
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Key Feature: Auto-Sync with Schema

**When you change the database schema, types update automatically!**

Example: Add a new column to projects table:

```typescript
// backend/src/db/schema.ts
export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  color: varchar({ length: 7 }), // ← NEW FIELD
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

TypeScript automatically recognizes the new `color` field in frontend:

```typescript
// Frontend - TypeScript knows about 'color' immediately!
const { data: projects } = useProjectsRPC();
projects[0].color // ✅ TypeScript knows this exists
```

## Setup

### Frontend (tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@trello-demo/shared": ["../shared/types.ts"],
      "@trello-demo/backend/*": ["../backend/src/*"]
    }
  }
}
```

### Backend (tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@trello-demo/shared": ["../shared/types.ts"]
    }
  }
}
```

**Why the extra `@trello-demo/backend/*` alias in frontend?**
- The shared package imports directly from backend schema
- This allows moving folders without breaking imports
- Clean alias instead of relative paths like `../../backend/src/`

### Shared Package (package.json)
```json
{
  "devDependencies": {
    "drizzle-orm": "0.44.6"
  }
}
```

**Important:** The `drizzle-orm` version in shared must exactly match the backend version (without `^`). This prevents TypeScript type incompatibility errors.

## Benefits

✅ **No Relative Imports** - Clean imports from both apps
✅ **Auto-Synced Types** - Types derived from Drizzle schema using `InferSelectModel`
✅ **Zero Manual Updates** - Change schema → types update automatically
✅ **Type Safety** - Frontend can't use fields that don't exist in database
✅ **Portable** - Easy to move folders or extract to npm package
✅ **Scalable** - Can publish to npm or private registry later

## Type Generation Flow

1. **Source of Truth**: `backend/src/db/schema.ts` (Drizzle schema)
2. **Type Inference**: `backend/src/db/schema-types.ts` uses `InferSelectModel`
3. **Re-export**: `shared/types.ts` re-exports for easy importing
4. **Usage**: Frontend and backend import from `@trello-demo/shared`

## Migration Path

If you want to publish this as a real package:

1. Add build step (e.g., `tsc`)
2. Publish to npm or private registry
3. Install as dependency: `bun add @trello-demo/shared`
4. Remove path aliases from tsconfig
