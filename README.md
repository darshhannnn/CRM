# CRM

A production-ready lightweight CRM built with Next.js, Prisma, SQLite, and Tailwind CSS.

## Features

- Contact management with create, update, delete, search, and tag filtering
- Tag management with color coding and contact counts
- Contact activity timeline with notes, calls, meetings, and WhatsApp entries
- Zod runtime validation on all API inputs
- Security headers (HSTS, XSS protection, CSP)
- Health check endpoint for monitoring
- Docker-ready with health checks
- 61 automated tests

## Tech Stack

- Next.js 14 App Router
- React 18
- Prisma ORM
- SQLite
- Tailwind CSS
- Zod (runtime validation)
- Vitest (testing)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create the database schema:

```bash
npm run db:push
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/contacts` | List contacts (supports `?q=` and `?tagId=`) |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/:id` | Get contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| GET | `/api/contacts/:id/interactions` | List interactions |
| POST | `/api/contacts/:id/interactions` | Create interaction |
| PUT | `/api/contacts/:id/interactions/:interactionId` | Update interaction |
| DELETE | `/api/contacts/:id/interactions/:interactionId` | Delete interaction |
| GET | `/api/tags` | List tags |
| POST | `/api/tags` | Create tag |
| PUT | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |

## Docker Production

Build and run with Docker Compose:

```bash
docker compose up --build
```

The production container:
- Stores SQLite database at `/app/data/dev.db`
- Runs health checks every 30 seconds
- Persists data via Docker volume

## Production Deployment

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite database URL |
| `NODE_ENV` | Yes | `production` | Node environment |
| `PORT` | No | `3000` | Server port |

### Deployment Checklist

- [ ] Set `DATABASE_URL` environment variable
- [ ] Run `npm run db:push` to initialize schema
- [ ] Run `npm run build` to build for production
- [ ] Run `npm run start` to start production server
- [ ] Verify health check at `/api/health`
- [ ] Configure reverse proxy (nginx/caddy) with HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring/alerting

### Database Backups

SQLite database is a single file. Backup strategy:

```bash
# Copy the database file
cp /app/data/dev.db /backups/dev-$(date +%Y%m%d).db

# Or use sqlite3 backup
sqlite3 /app/data/dev.db ".backup '/backups/dev.db'"
```

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── contacts/     # Contact CRUD
│   │   ├── tags/         # Tag CRUD
│   │   └── health/       # Health check
│   ├── contacts/         # Contact detail page
│   └── tags/             # Tags management page
├── components/           # Reusable UI components
├── lib/
│   ├── api-client.ts     # Frontend API client
│   ├── api-utils.ts      # Backend utilities
│   ├── prisma.ts         # Prisma client singleton
│   ├── validation.ts     # Zod schemas
│   └── utils.ts          # General utilities
└── middleware.ts          # Security headers
```

## License

MIT
