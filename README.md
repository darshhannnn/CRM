# CRM

A lightweight CRM built with Next.js, Prisma, SQLite, and Tailwind CSS.

## Features

- Contact management with create, update, delete, search, and tag filtering
- Tag management with color coding and contact counts
- Contact activity timeline with notes, calls, meetings, and WhatsApp entries
- API validation and friendly error responses
- Docker-ready production build

## Tech Stack

- Next.js 14 App Router
- React 18
- Prisma ORM
- SQLite
- Tailwind CSS

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

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
npm run db:studio
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

The production container stores the SQLite database at `/app/data/dev.db`.
