# Trello Demo - Real-time Fullstack Application

A modern fullstack Trello-like application with **true real-time updates** powered by PostgreSQL LISTEN/NOTIFY and WebSockets. Any database change from any source (app, Drizzle Studio, SQL client) instantly updates all connected clients.

## Features

- **True Real-time Updates**: Changes propagate instantly to all clients, regardless of source
- **PostgreSQL LISTEN/NOTIFY**: Database-level change notifications via triggers
- **WebSocket Broadcasting**: All clients receive updates simultaneously
- **Zero Polling**: No unnecessary API calls - purely event-driven
- **Drizzle Studio Compatible**: Edit data in Drizzle Studio and see instant frontend updates
- **Type-safe**: End-to-end TypeScript with Drizzle ORM
- **Modern Stack**: Bun, React 19, TanStack Router, TanStack Query

## Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework
- **Database**: PostgreSQL 16 with Docker
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL toolkit
- **Validation**: Zod v4
- **Real-time**: Native WebSocket + PostgreSQL LISTEN/NOTIFY

### Frontend
- **Framework**: React 19
- **Routing**: [TanStack Router](https://tanstack.com/router) v1 with SSR support
- **State**: [TanStack Query](https://tanstack.com/query) v5 (React Query)
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting**: Biome

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Any Database Change Source                                 │
│  (App, Drizzle Studio, pgAdmin, SQL Client)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ PostgreSQL Database   │
         │ Trigger Fires         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ NOTIFY sends to       │
         │ 'table_changes'       │
         │ channel               │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Backend LISTEN        │
         │ receives notification │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ WebSocket broadcast   │
         │ to ALL clients        │
         └───────────┬───────────┘
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
        Client1  Client2  Client3
        React Query cache updates
        UI re-renders instantly
```

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sivaSai9177/trello-demo.git
cd trello-demo
```

### 2. Start PostgreSQL

```bash
cd backend
docker-compose up -d
```

### 3. Install Backend Dependencies & Run Migrations

```bash
cd backend
bun install
bun run drizzle-kit push
```

### 4. Install PostgreSQL Triggers

The triggers are what enable real-time updates from any source:

```bash
docker exec -i trello-db psql -U shivauser -d trelloDb < drizzle/triggers.sql
```

**Verify triggers are installed:**
```bash
docker exec trello-db psql -U shivauser -d trelloDb -c "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';"
```

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
bun install
bun run dev
```

Frontend runs at: `http://localhost:3000`

## Testing Real-time Updates

### Method 1: Via Application
1. Open `http://localhost:3000` in multiple browser tabs
2. Create/update/delete a project
3. All tabs update instantly

### Method 2: Via Drizzle Studio
```bash
cd backend
bun run drizzle-kit studio
```
1. Open `projects` table
2. Edit a project name
3. **Watch all browser tabs update instantly!**

### Method 3: Via Direct SQL
```bash
docker exec -it trello-db psql -U shivauser -d trelloDb
```

```sql
UPDATE projects SET name = 'Updated from SQL!' WHERE id = 1;
```

All clients update instantly!

### Method 4: Test Script
```bash
cd backend
./test-triggers.sh
```

## Project Structure

```
trello-demo/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── db.ts              # Database connection + LISTEN setup
│   │   │   └── schema.ts          # Drizzle schema definitions
│   │   ├── routes/
│   │   │   ├── projects.ts        # Projects CRUD + WebSocket broadcast
│   │   │   ├── tasks.ts           # Tasks CRUD + WebSocket broadcast
│   │   │   └── comments.ts        # Comments CRUD + WebSocket broadcast
│   │   ├── ws/
│   │   │   └── manager.ts         # WebSocket connection manager
│   │   ├── index.ts               # Hono app setup
│   │   └── server.ts              # Bun server + LISTEN initialization
│   ├── drizzle/
│   │   └── triggers.sql           # PostgreSQL LISTEN/NOTIFY triggers
│   ├── docker-compose.yml         # PostgreSQL setup
│   ├── drizzle.config.ts
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectsList.tsx   # Projects list with real-time updates
│   │   │   └── ConnectionStatus.tsx # WebSocket status indicator
│   │   ├── hooks/
│   │   │   ├── useProjects.ts     # React Query hooks for projects
│   │   │   └── useWebSocket.ts    # WebSocket hook with reconnection
│   │   ├── routes/
│   │   │   └── index.tsx          # Main route
│   │   └── router.tsx             # TanStack Router setup
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgres://shivauser:shivapass@localhost:5432/trelloDb
```

## Key Features Explained

### PostgreSQL LISTEN/NOTIFY

PostgreSQL triggers automatically fire on any database change and send notifications:

```sql
-- Trigger fires on INSERT/UPDATE/DELETE
CREATE TRIGGER projects_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_table_change();
```

### Backend LISTEN

The backend subscribes to PostgreSQL notification channels:

```typescript
await listenerClient.query("LISTEN projects_changes");

listenerClient.on("notification", (msg) => {
  const { table, operation, record } = JSON.parse(msg.payload);
  broadcast({ type: "project:updated", payload: record });
});
```

### WebSocket Broadcasting

All database changes are broadcast to all connected clients:

```typescript
export function broadcast(data: unknown) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
```

### Frontend WebSocket Hook

React hook with exponential backoff reconnection and heartbeat:

```typescript
const { connectionStatus } = useWebSocket("ws://localhost:3002");
// connectionStatus: "connecting" | "connected" | "disconnected" | "error"
```

## Development Commands

### Backend
```bash
bun run dev              # Start dev server
bun run drizzle-kit push # Push schema changes
bun run drizzle-kit studio # Open Drizzle Studio
```

### Frontend
```bash
bun run dev              # Start dev server
bun run build            # Production build
bun run test             # Run tests
bun run lint             # Lint code
bun run format           # Format code
```

### Database
```bash
docker-compose up -d              # Start PostgreSQL
docker-compose down               # Stop PostgreSQL
docker-compose down -v            # Stop and remove volumes
docker logs -f trello-db          # View logs
docker exec -it trello-db psql -U shivauser -d trelloDb  # Connect to PostgreSQL
```

## Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
docker ps | grep trello

# Check logs
docker logs trello-db

# Restart
docker-compose restart
```

### Triggers not firing
```bash
# Verify triggers exist
docker exec trello-db psql -U shivauser -d trelloDb \
  -c "SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';"

# Re-apply triggers
docker exec -i trello-db psql -U shivauser -d trelloDb < drizzle/triggers.sql
```

### WebSocket not connecting
- Check backend console for: `📡 Database listener connected`
- Check browser console for: `✅ WebSocket connected`
- Verify backend is running on port 3002
- Look for green "Connected" indicator in top-right corner

## Performance

- **Real-time latency**: < 100ms from database change to UI update
- **No polling overhead**: Zero unnecessary network requests
- **Scalable**: PostgreSQL NOTIFY is highly efficient
- **Reliable**: Exponential backoff reconnection with heartbeat

## Future Enhancements

- [ ] Authentication & Authorization
- [ ] Task management UI with drag-and-drop
- [ ] Comments system
- [ ] User assignments
- [ ] Activity feed
- [ ] Email notifications
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] CI/CD pipeline
- [ ] Docker deployment

## Documentation

- [Backend Real-time Setup Guide](backend/REALTIME-SETUP.md)
- [PostgreSQL Triggers Explanation](backend/drizzle/triggers.sql)

## License

MIT

## Author

[sivaSai9177](https://github.com/sivaSai9177)

---

Built with Bun, Hono, React, and PostgreSQL LISTEN/NOTIFY
