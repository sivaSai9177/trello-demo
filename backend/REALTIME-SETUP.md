# PostgreSQL LISTEN/NOTIFY Real-time Setup Guide

## Overview
This project uses PostgreSQL LISTEN/NOTIFY to achieve true real-time updates across all clients, including changes made directly in the database via Drizzle Studio, pgAdmin, or any SQL client.

## Architecture Flow

```
Any DB Change (App, Drizzle Studio, SQL Client)
  ↓
PostgreSQL Trigger Fires
  ↓
NOTIFY sends message to channel
  ↓
Backend LISTEN receives notification
  ↓
WebSocket broadcasts to all clients
  ↓
Frontend React Query cache updates instantly
```

## Setup Instructions

### 1. Start PostgreSQL with Docker

```bash
cd backend
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with the credentials from `.env`.

### 2. Run Database Migrations

Apply your Drizzle schema to create tables:

```bash
cd backend
bun run drizzle-kit push
# or
bun run drizzle-kit migrate
```

### 3. Apply PostgreSQL Triggers

The triggers are automatically applied if you use Docker Compose (they're in `docker-entrypoint-initdb.d`).

**If you need to apply them manually:**

```bash
psql postgres://shivauser:shivapass@localhost:5432/trelloDb -f drizzle/triggers.sql
```

Or via Drizzle Studio:
1. Open Drizzle Studio: `bun run drizzle-kit studio`
2. Go to SQL Runner
3. Copy contents of `drizzle/triggers.sql` and execute

### 4. Verify Triggers Are Installed

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

You should see triggers for:
- `projects_notify_trigger` on `projects`
- `tasks_notify_trigger` on `tasks`
- `comments_notify_trigger` on `comments`
- `users_notify_trigger` on `users`

### 5. Start Backend Server

```bash
cd backend
bun run dev
```

Expected output:
```
🚀 Server running at http://localhost:3002
📡 Database listener connected
👂 Listening to database changes: projects, tasks, comments
```

### 6. Start Frontend

```bash
cd frontend
bun run dev
```

## Testing Real-time Updates

### Test 1: Via App (Should work)
1. Open browser at `http://localhost:3000`
2. Create/update/delete a project
3. ✅ All clients update instantly via WebSocket

### Test 2: Via Drizzle Studio (Main goal!)
1. Open Drizzle Studio: `cd backend && bun run drizzle-kit studio`
2. Go to `projects` table
3. Edit a project name or create new project
4. ✅ Frontend updates instantly without refresh!

### Test 3: Via Direct SQL
```bash
psql postgres://shivauser:shivapass@localhost:5432/trelloDb
```

```sql
-- Update a project
UPDATE projects SET name = 'Updated from SQL!' WHERE id = 1;

-- Insert a new project
INSERT INTO projects (name, description)
VALUES ('New from SQL', 'This was created via SQL');

-- Delete a project
DELETE FROM projects WHERE id = 2;
```

✅ All changes should appear instantly in all browser clients!

## How It Works

### 1. Database Triggers (`drizzle/triggers.sql`)
- Triggers fire on INSERT/UPDATE/DELETE for all tables
- They call `notify_table_change()` function
- This function sends a JSON payload via `pg_notify()`

### 2. Backend Listener (`src/db/db.ts`)
- Dedicated PostgreSQL client subscribes to channels:
  - `projects_changes`
  - `tasks_changes`
  - `comments_changes`
- Receives notifications and parses JSON payload
- Maps operations to WebSocket event types
- Broadcasts to all connected WebSocket clients

### 3. Frontend (`src/hooks/useWebSocket.ts`)
- WebSocket receives broadcast
- Updates React Query cache
- UI updates reactively

## Troubleshooting

### Backend doesn't start
```bash
# Check if PostgreSQL is running
docker ps

# Check logs
docker logs trello-demo-postgres

# Restart container
docker-compose restart
```

### Triggers not firing
```sql
-- List all triggers
SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Test notification manually
NOTIFY projects_changes, '{"test": "message"}';
```

### WebSocket not connected
- Check browser console for connection errors
- Verify backend is running on port 3002
- Check firewall/network settings

### Changes not appearing
1. Check backend console for: `🔔 DB Change: projects - UPDATE`
2. Check browser console for: `📨 Received: {type: "project:updated"...}`
3. Verify triggers are installed (see above)

## Benefits

✅ **True Real-time** - Instant updates from any source
✅ **No Polling** - Zero network overhead
✅ **Works with Drizzle Studio** - Edit DB directly, see changes live
✅ **Scalable** - PostgreSQL NOTIFY is very efficient
✅ **Database-agnostic source** - Works with any tool that modifies the DB

## Environment Variables

```env
DATABASE_URL=postgres://shivauser:shivapass@localhost:5432/trelloDb
```

## Additional Commands

```bash
# Stop PostgreSQL
docker-compose down

# Stop and remove data (fresh start)
docker-compose down -v

# View PostgreSQL logs
docker logs -f trello-demo-postgres

# Connect to PostgreSQL
psql postgres://shivauser:shivapass@localhost:5432/trelloDb

# Open Drizzle Studio
cd backend && bun run drizzle-kit studio
```
