# Development Guide - Trello Demo

This guide provides in-depth technical documentation for developers working on the Trello Demo application.

## Table of Contents

- [Type Sharing Architecture](#type-sharing-architecture)
- [Multi-Repo Setup](#multi-repo-setup)
- [Local Development Workflow](#local-development-workflow)
- [Publishing Workflow](#publishing-workflow)
- [Real-Time System](#real-time-system)
- [Database Schema](#database-schema)
- [API Structure](#api-structure)
- [Advanced Troubleshooting](#advanced-troubleshooting)
- [CI/CD Recommendations](#cicd-recommendations)

## Type Sharing Architecture

### Overview

This project implements a sophisticated type-sharing system that maintains end-to-end type safety across separate repositories:

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Schema (Drizzle)                │
│                     drizzle/schema.ts                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ InferSelectModel
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  TypeScript Types (Auto-generated)          │
│                     src/types.ts                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              NPM Package (@your-org/trello-backend-types)   │
│                     src/exports.ts                          │
│  Exports: Types, Schemas, Router Types                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  Web App  │  │ Mobile App│  │ Admin App │
     └───────────┘  └───────────┘  └───────────┘
```

### Key Components

#### 1. Database Schema (Single Source of Truth)

Located in [backend/src/db/schema.ts](backend/src/db/schema.ts), defines all database tables using Drizzle ORM:

```typescript
export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### 2. Type Generation

Located in [backend/src/types.ts](backend/src/types.ts), uses Drizzle's `InferSelectModel` to automatically generate TypeScript types:

```typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { projectsTable, tasksTable } from "./db/schema";

export type Project = InferSelectModel<typeof projectsTable>;
export type ProjectInsert = InferInsertModel<typeof projectsTable>;
export type Task = InferSelectModel<typeof tasksTable>;
// ...
```

This approach ensures:
- Zero manual type maintenance
- Compile-time errors if schema changes break frontend
- Single source of truth for data structure

#### 3. Validation Schemas

Located in [backend/src/schemas/](backend/src/schemas/), Zod schemas provide runtime validation and can be reused in frontend:

```typescript
// backend/src/schemas/project.schema.ts
export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const projectIdSchema = z.object({
  id: z.number(),
});
```

#### 4. Package Entry Point

Located in [backend/src/exports.ts](backend/src/exports.ts), defines the public API of the types package:

```typescript
// Router Types (for oRPC client)
export { appRouter } from "./rpc/index";
export type { AppRouter } from "./rpc/index";

// Database Types
export type { Project, Task, Comment, User } from "./types";
export type { ProjectInsert, TaskInsert } from "./types";

// Validation Schemas
export { projectSchema, projectIdSchema } from "./schemas/project.schema";
export { taskCreateSchema, taskUpdateSchema } from "./schemas/task.schema";
// ...
```

## Multi-Repo Setup

### Scenario: Backend and Frontend in Separate Repositories

#### Backend Repository Setup

1. **Configure package.json as publishable:**

```json
{
  "name": "@your-org/trello-backend-types",
  "version": "1.0.0",
  "description": "Shared types and schemas for Trello backend API",
  "main": "./dist/exports.js",
  "types": "./dist/exports.d.ts",
  "exports": {
    ".": {
      "types": "./dist/exports.d.ts",
      "import": "./dist/exports.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build:types": "tsc -p tsconfig.types.json",
    "prepublishOnly": "bun run build:types"
  },
  "peerDependencies": {
    "drizzle-orm": ">=0.44.0",
    "zod": ">=4.0.0"
  }
}
```

2. **Create tsconfig.types.json:**

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "strict": true
  },
  "include": [
    "src/exports.ts",
    "src/types.ts",
    "src/schemas/**/*",
    "src/rpc/index.ts",
    "src/db/schema.ts"
  ]
}
```

3. **Build and publish:**

```bash
cd backend
bun run build:types  # Creates dist/ folder
npm publish --access public  # or private
```

#### Frontend Repository Setup

1. **Install the types package:**

```bash
cd frontend
bun add @your-org/trello-backend-types
```

2. **Use types in code:**

```typescript
import type { Project, Task } from "@your-org/trello-backend-types";
import { projectSchema } from "@your-org/trello-backend-types";
import type { AppRouter } from "@your-org/trello-backend-types";

// Create type-safe oRPC client
const orpcClient = createORPCClient<AppRouter>({
  baseURL: "http://localhost:3002",
});
```

### Supporting Multiple Frontends

Each frontend installs the same types package:

```bash
# Web App
cd apps/web
bun add @your-org/trello-backend-types@^1.0.0

# Mobile App
cd apps/mobile
npm install @your-org/trello-backend-types@^1.0.0

# Admin Panel
cd apps/admin
yarn add @your-org/trello-backend-types@^1.0.0
```

### Versioned Type Contracts

Use semantic versioning for API stability:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (field removed, type changed)
- **MINOR** (1.0.0 → 1.1.0): New features (new field added, nullable)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (documentation, non-code changes)

Example workflow:

```bash
# Backend team makes breaking change
cd backend
# Update version in package.json: 1.0.0 → 2.0.0
bun run build:types
npm publish

# Frontend teams update when ready
cd frontend
bun add @your-org/trello-backend-types@^2.0.0
# Fix TypeScript errors from breaking changes
```

## Local Development Workflow

### Using `bun link` for Instant Type Updates

For local development, use `bun link` to avoid publishing on every change:

1. **Link backend types (one-time setup):**

```bash
cd backend
bun link
# Output: Success! Registered "@your-org/trello-backend-types"
```

2. **Use linked package in frontend (one-time setup):**

```bash
cd frontend
bun link @your-org/trello-backend-types
# Creates symlink: node_modules/@your-org/trello-backend-types → ../../../backend
```

3. **Development workflow:**

```bash
# Terminal 1 - Backend
cd backend
bun run dev  # Changes to types auto-detected

# Terminal 2 - Frontend
cd frontend
bun run dev  # Vite hot-reloads on type changes
```

**Important:** The `bun link` persists across server restarts. You only need to link once unless you delete `node_modules`.

### Unlink When Ready to Publish

Before deploying, switch to the published package:

```bash
cd frontend
bun unlink @your-org/trello-backend-types
bun add @your-org/trello-backend-types@latest
```

## Publishing Workflow

### Manual Publishing

```bash
cd backend

# 1. Update version in package.json
# 2. Build types
bun run build:types

# 3. Verify build
ls -la dist/

# 4. Publish
npm publish --access public  # or --access restricted
```

### GitHub Packages Alternative

Configure `.npmrc` in backend:

```
@your-org:registry=https://npm.pkg.github.com
```

Update `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Publish:

```bash
npm publish
```

## Real-Time System

### Architecture

The real-time system uses PostgreSQL LISTEN/NOTIFY + WebSockets for database-level change notifications:

```
┌──────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                    │
│  Triggers on INSERT/UPDATE/DELETE → NOTIFY 'db_changes' │
└───────────────────────┬──────────────────────────────────┘
                        │ LISTEN 'db_changes'
                        ↓
┌──────────────────────────────────────────────────────────┐
│                    Backend Server (Bun)                   │
│  - PostgreSQL Client listens to notifications            │
│  - Broadcasts to all WebSocket clients                   │
└───────────────────────┬──────────────────────────────────┘
                        │ WebSocket
            ┌───────────┼───────────┐
            ↓           ↓           ↓
      ┌─────────┐ ┌─────────┐ ┌─────────┐
      │Client 1 │ │Client 2 │ │Client 3 │
      └─────────┘ └─────────┘ └─────────┘
```

### PostgreSQL Triggers

Located in [backend/drizzle/triggers.sql](backend/drizzle/triggers.sql):

```sql
CREATE OR REPLACE FUNCTION notify_projects_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify('db_changes', json_build_object(
      'table', 'projects',
      'operation', 'INSERT',
      'data', row_to_json(NEW)
    )::text);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM pg_notify('db_changes', json_build_object(
      'table', 'projects',
      'operation', 'UPDATE',
      'data', row_to_json(NEW)
    )::text);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM pg_notify('db_changes', json_build_object(
      'table', 'projects',
      'operation', 'DELETE',
      'data', row_to_json(OLD)
    )::text);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_projects_change();
```

### Backend Listener

Located in [backend/src/db/index.ts](backend/src/db/index.ts):

```typescript
import { Client } from "pg";

export const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

export async function setupDatabaseListener(broadcast: (message: any) => void) {
  await pgClient.connect();

  pgClient.on("notification", (msg) => {
    if (msg.channel === "db_changes") {
      const payload = JSON.parse(msg.payload!);

      // Broadcast to all WebSocket clients
      if (payload.table === "projects") {
        if (payload.operation === "INSERT") {
          broadcast({ type: "project:created", payload: payload.data });
        } else if (payload.operation === "UPDATE") {
          broadcast({ type: "project:updated", payload: payload.data });
        } else if (payload.operation === "DELETE") {
          broadcast({ type: "project:deleted", payload: payload.data });
        }
      }
    }
  });

  await pgClient.query("LISTEN db_changes");
  console.log("📡 Database listener connected");
}
```

### Frontend WebSocket Store

Located in [frontend/src/stores/websocket.store.ts](frontend/src/stores/websocket.store.ts):

Key features:
- Exponential backoff reconnection (1s → 2s → 4s → 8s → 16s → max 30s)
- Heartbeat ping/pong to keep connection alive
- Optimistic cache updates via TanStack Query

```typescript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case "project:updated":
      queryClient.setQueryData(["projects"], (old: Project[] = []) => {
        return old.map((p) =>
          p.id === message.payload.id ? message.payload : p
        );
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      break;
    // ...
  }
};
```

### Why This Approach?

1. **Database-level events:** Changes from ANY source (app, Drizzle Studio, direct SQL, other services) trigger updates
2. **No polling:** Real-time with zero client polling overhead
3. **Scalable:** PostgreSQL handles notification fan-out efficiently
4. **Reliable:** PostgreSQL guarantees delivery to connected clients

## Database Schema

### Tables

**projects:**
- `id` (serial, PK)
- `name` (text, NOT NULL)
- `description` (text)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**tasks:**
- `id` (serial, PK)
- `projectId` (integer, FK → projects.id)
- `title` (text, NOT NULL)
- `description` (text)
- `status` (enum: todo, in_progress, done)
- `priority` (enum: low, medium, high)
- `assigneeId` (integer, FK → users.id, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**comments:**
- `id` (serial, PK)
- `taskId` (integer, FK → tasks.id)
- `text` (text, NOT NULL)
- `createdAt` (timestamp)

**users:**
- `id` (serial, PK)
- `name` (text, NOT NULL)
- `email` (text, NOT NULL, unique)
- `createdAt` (timestamp)

### Running Migrations

```bash
cd backend

# Push schema changes to database
bun run drizzle-kit push

# Open Drizzle Studio to view data
bun run drizzle-kit studio
```

### Installing Triggers

After schema changes:

```bash
docker exec -i trello-db psql -U shivauser -d trelloDb < drizzle/triggers.sql
```

## API Structure

### oRPC Procedures

Located in [backend/src/rpc/procedures/](backend/src/rpc/procedures/):

**projects.ts:**
```typescript
export const projectsProcedures = {
  getAll: publicProcedure.query(async ({ context }) => {
    return await context.db.select().from(projectsTable);
  }),

  getById: publicProcedure
    .input(projectIdSchema)
    .query(async ({ context, input }) => {
      const project = await context.db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, input.id))
        .limit(1);
      return project[0];
    }),

  create: publicProcedure
    .input(projectSchema)
    .mutation(async ({ context, input }) => {
      const [project] = await context.db
        .insert(projectsTable)
        .values(input)
        .returning();
      return project;
    }),

  update: publicProcedure
    .input(projectUpdateSchema)
    .mutation(async ({ context, input }) => {
      const [project] = await context.db
        .update(projectsTable)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(projectsTable.id, input.id))
        .returning();
      return project;
    }),

  delete: publicProcedure
    .input(projectIdSchema)
    .mutation(async ({ context, input }) => {
      const [project] = await context.db
        .delete(projectsTable)
        .where(eq(projectsTable.id, input.id))
        .returning();
      return project;
    }),
};
```

### Frontend oRPC Client

Located in [frontend/src/lib/orpc-client.ts](frontend/src/lib/orpc-client.ts):

```typescript
import { createORPCClient } from "@orpc/client";
import type { AppRouter } from "@your-org/trello-backend-types";

export const orpcClient = createORPCClient<AppRouter>({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002",
});
```

Type-safe usage:

```typescript
// Frontend gets full autocomplete and type safety
const projects = await orpcClient.projects.getAll();
//    ^? Project[]

const project = await orpcClient.projects.create({
  name: "New Project",
  description: "Description",
});
//    ^? Project
```

## Advanced Troubleshooting

### Types Not Updating After Schema Change

**Symptom:** Frontend still shows old types after database schema change.

**Solution:**
```bash
cd backend
bun run build:types  # Rebuild types package
# Restart frontend dev server (Vite should auto-reload)
```

### WebSocket Not Connecting

**Check backend listener:**
```bash
# Backend logs should show:
# 📡 Database listener connected
```

**Check frontend connection:**
- Look for green "Connected" indicator in UI
- Check browser console for WebSocket errors

**Verify backend port:**
```bash
lsof -i:3002  # Should show backend process
```

### Real-Time Updates Not Working

**Test database triggers:**
```bash
docker exec -it trello-db psql -U shivauser -d trelloDb

-- Test trigger manually
UPDATE projects SET name = 'Test Update' WHERE id = 1;

-- Check if notification was sent (in backend logs)
```

**Reinstall triggers:**
```bash
docker exec -i trello-db psql -U shivauser -d trelloDb < drizzle/triggers.sql
```

### TypeScript Errors After Dependency Update

**Symptom:** Build fails with peer dependency type errors.

**Solution:** Ensure `skipLibCheck: true` in `tsconfig.types.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### bun link Connection Lost

**Symptom:** Import errors after deleting `node_modules`.

**Solution:** Re-link (one-time):
```bash
cd backend && bun link
cd frontend && bun link @your-org/trello-backend-types
```

## CI/CD Recommendations

### Backend CI Pipeline

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Build types package
        run: bun run build:types

      - name: Verify types build
        run: ls -la dist/

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Build and publish
        run: |
          bun install
          bun run build:types
          echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc
          npm publish --access public
```

### Frontend CI Pipeline

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Type check
        run: bun run type-check

      - name: Lint
        run: bun run lint

      - name: Build
        run: bun run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

### Deployment

**Backend (Fly.io example):**

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly secrets set DATABASE_URL="postgres://..."
fly deploy
```

**Frontend (Vercel example):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
# Set environment variable: VITE_API_URL=https://your-backend.fly.dev
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/trelloDb
PORT=3002
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3002
VITE_WS_URL=ws://localhost:3002
```

**Production:**
- Backend: Set `DATABASE_URL` in hosting platform
- Frontend: Set `VITE_API_URL` to production backend URL

---

## Additional Resources

- [oRPC Documentation](https://orpc.unnoq.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Query Docs](https://tanstack.com/query)
- [Bun Documentation](https://bun.sh/docs)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)

## Contributing

See [README.md](README.md) for contribution guidelines.

## Support

For issues and questions:
1. Check this guide's troubleshooting section
2. Review [README.md](README.md) quick start
3. Open an issue on GitHub
