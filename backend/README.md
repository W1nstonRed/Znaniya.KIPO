# Edu Platform Backend

NestJS API for the edu platform.

## Run

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:3000/api` by default.

## Current endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/groups`
- `PATCH /api/groups/:id/favorite`
- `GET /api/specializations`
- `GET /api/students`

Data is stored in memory for now. The next natural step is adding PostgreSQL with Prisma or TypeORM.
