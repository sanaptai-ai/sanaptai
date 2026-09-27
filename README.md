# SANAPTAI Backend V1

Starter Node.js API for the SANAPTAI AI video generator.

## Run locally

```bash
npm install
npm start
```

Health check: `GET /health`

## Current API

- `POST /api/signup`
- `GET /api/credits/:email`
- `POST /api/projects`
- `GET /api/projects/:id`

Duration is limited to 10–1200 seconds. Credit cost is 15 credits per 10-second unit.

This is a prototype backend. Production authentication, PostgreSQL, payments, persistent credit ledger, job queue, and AI/video provider integrations are still required.
