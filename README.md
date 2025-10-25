# Trello Demo - Full Stack Type-Safe Real-Time Application

A modern, production-ready full-stack application with end-to-end type safety, real-time updates via PostgreSQL LISTEN/NOTIFY + WebSockets, and multi-repo type sharing support.

## 🚀 Tech Stack

**Backend:** Bun + Hono + PostgreSQL + Drizzle ORM + oRPC + Zod
**Frontend:** React 19 + TanStack (Router, Query, Form) + Tailwind CSS
**Type Sharing:** npm package with automatic Drizzle type inference

## ✨ Key Features

- ✅ **End-to-End Type Safety** - From database to UI with zero code generation
- ✅ **True Real-Time Updates** - PostgreSQL LISTEN/NOTIFY + WebSockets
- ✅ **Multi-Repo Ready** - Types shared via publishable npm package
- ✅ **Form Validation** - TanStack Form with Zod (client + server validation)
- ✅ **Optimized Performance** - Smart re-renders and efficient queries
- ✅ **Database-Level Events** - Changes from any source (app, Drizzle Studio, SQL) update all clients

## 🏁 Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed
- PostgreSQL 16 running
- Docker (optional, for PostgreSQL)

### 1. Setup

```bash
# Clone and install
git clone <repo-url>
cd trello-demo

# Backend setup
cd backend
bun install
docker-compose up -d  # Start PostgreSQL

# Apply database schema
bun run drizzle-kit push

# Install triggers (for real-time)
docker exec -i trello-db psql -U shivauser -d trelloDb < drizzle/triggers.sql

# Frontend setup
cd ../frontend
bun install
```

### 2. Link Types (Local Development)

```bash
# Backend
cd backend
bun link

# Frontend
cd ../frontend
bun link @your-org/trello-backend-types
```

**Note:** This link persists across server restarts. Only needs to be done once.

### 3. Start Servers

```bash
# Terminal 1 - Backend (port 3002)
cd backend
bun run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
bun run dev
```

Visit **http://localhost:3000**

## 📖 Common Commands

### Backend
```bash
bun run dev              # Start dev server with hot reload
bun run build:types      # Build types package for publishing
bun run drizzle-kit push # Push schema changes to database
bun run drizzle-kit studio # Open Drizzle Studio
```

### Frontend
```bash
bun run dev              # Start Vite dev server
bun run build            # Build for production
bun run lint             # Run linter
bun run test             # Run tests
```

## 🎯 Features

### Create/Edit/Delete Projects
- Form at top for create/edit (single form for both)
- Hover over projects to see Edit/Delete buttons
- Click Edit → form populates with project data
- Real-time validation with Zod
- Updates broadcast to all clients instantly

### Real-Time Updates
- Any database change triggers WebSocket broadcast
- Works from app, Drizzle Studio, or direct SQL
- Exponential backoff reconnection
- Connection status indicator

## 📁 Project Structure

```
trello-demo/
├── backend/
│   ├── src/
│   │   ├── db/              # Drizzle schema + LISTEN setup
│   │   ├── rpc/             # oRPC procedures (type-safe API)
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── types.ts         # Auto-generated types
│   │   └── exports.ts       # Package entry point
│   ├── dist/                # Built types package
│   └── drizzle/triggers.sql # PostgreSQL real-time triggers
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks (useProjectsRPC, etc.)
│   │   ├── routes/          # TanStack Router routes
│   │   └── stores/          # WebSocket + global state
│   └── package.json
│
├── README.md                # This file
└── DEVELOPMENT_GUIDE.md     # Detailed technical docs
```

## 🔄 Type Sharing

### How It Works

```
Database Schema (Drizzle)
    ↓ InferSelectModel
TypeScript Types (auto-generated)
    ↓ Published as npm package
Frontend Imports
```

### Current Setup (Development)
```bash
# Backend types linked to frontend
frontend/node_modules/@your-org/trello-backend-types → ../../../backend
```

### Production Setup
```bash
# 1. Backend: Build and publish
cd backend
bun run build:types
npm publish --access public

# 2. Frontend: Install
cd frontend
bun add @your-org/trello-backend-types
```

See **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** for details on publishing workflow.

## 🧪 Testing Real-Time

### Test from Drizzle Studio
```bash
cd backend
bun run drizzle-kit studio
# Edit a project → all browser tabs update instantly!
```

### Test from SQL
```bash
docker exec -it trello-db psql -U shivauser -d trelloDb
UPDATE projects SET name = 'Updated from SQL!' WHERE id = 1;
# All clients update instantly!
```

## 🐛 Troubleshooting

### "bun link" connection lost
```bash
# Re-link (only if you deleted node_modules)
cd backend && bun link
cd frontend && bun link @your-org/trello-backend-types
```

### Backend won't start
```bash
# Check PostgreSQL
docker ps | grep trello-db
docker-compose restart

# Check port
lsof -ti:3002 | xargs kill -9
```

### Types not updating
```bash
# Rebuild types package
cd backend
bun run build:types
```

### WebSocket not connecting
- Check backend shows: `📡 Database listener connected`
- Check frontend shows green "Connected" indicator
- Verify backend running on port 3002

## 🚢 Deployment

### Backend
- Deploy to Fly.io, Railway, or any platform supporting Bun
- Set `DATABASE_URL` environment variable
- Run migrations before starting

### Frontend
- Build: `bun run build`
- Deploy to Vercel, Netlify, Cloudflare Pages
- Set `VITE_API_URL` to backend URL

### Types Package
- Publish to npm or GitHub Packages
- Use semantic versioning (MAJOR.MINOR.PATCH)

## 📚 Documentation

- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Detailed technical guide
  - Type sharing architecture
  - Multi-repo setup
  - Publishing workflow
  - CI/CD recommendations
  - Advanced troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/my-feature`
6. Open Pull Request

## 📝 License

MIT

## 🙏 Built With

- [oRPC](https://orpc.unnoq.com) - Type-safe RPC framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [TanStack](https://tanstack.com) - Router, Query, Form
- [Bun](https://bun.sh) - JavaScript runtime
- [Hono](https://hono.dev) - Web framework
- [Zod](https://zod.dev) - Schema validation

---

**Happy Coding! 🚀**

For detailed technical documentation, see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
