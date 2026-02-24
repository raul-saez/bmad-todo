# Deployment Guide

This guide covers deploying bmad-todo to production environments.

## Table of Contents

- [Quick Deploy to Vercel](#quick-deploy-to-vercel)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Production Considerations](#production-considerations)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Deploy to Vercel

The easiest way to deploy bmad-todo is using the Vercel Platform:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment:**
   - Set `DATABASE_URL` (see [Database Setup](#database-setup))
   - Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bmad-todo)

---

## Manual Deployment

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- PostgreSQL database (for production)

### Build Process

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Start the production server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

### Required Variables

```bash
# Database connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### Optional Variables

```bash
# Node environment
NODE_ENV="production"

# Port (default: 3000)
PORT=3000

# Base URL for metadata
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Environment Variable Examples

**Development (SQLite):**
```bash
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

**Production (PostgreSQL on Vercel):**
```bash
DATABASE_URL="postgresql://user:pass@host.vercel-storage.com:5432/vercel_db"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://bmad-todo.vercel.app"
```

**Production (PostgreSQL on Railway):**
```bash
DATABASE_URL="postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway"
NODE_ENV="production"
```

---

## Database Setup

### Development (SQLite)

SQLite is used by default in development for simplicity:

```bash
DATABASE_URL="file:./dev.db"
npx prisma migrate dev
```

### Production (PostgreSQL)

For production, use PostgreSQL for better performance and reliability.

#### Option 1: Vercel Postgres

1. **Install Vercel Postgres:**
   ```bash
   npm i @vercel/postgres
   ```

2. **Create database:**
   - Go to your Vercel project
   - Navigate to Storage tab
   - Create new Postgres database
   - Copy connection string

3. **Set environment variable:**
   ```bash
   DATABASE_URL="postgresql://..."
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

#### Option 2: Other PostgreSQL Providers

Compatible with any PostgreSQL provider:
- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Open-source Firebase alternative
- [Railway](https://railway.app) - Simple deployment platform
- [PlanetScale](https://planetscale.com) - MySQL-compatible (requires Prisma adapter)

### Database Migrations

**Apply migrations in production:**
```bash
npx prisma migrate deploy
```

**Rollback migration (if needed):**
```bash
# Manually revert via SQL or restore from backup
# Prisma doesn't support automatic rollbacks
```

---

## Production Considerations

### Performance

1. **Enable Compression:**
   Next.js automatically compresses responses with gzip.

2. **Optimize Images:**
   Use Next.js Image component for automatic optimization.

3. **Database Connection Pooling:**
   Configure Prisma connection pooling:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL") // For migrations
   }
   ```

4. **Caching:**
   - API routes use Next.js caching
   - Client-side uses IndexedDB/localStorage

### Security

1. **HTTPS:**
   Always use HTTPS in production (automatic on Vercel).

2. **Environment Variables:**
   Never commit `.env` files to version control.

3. **Database Credentials:**
   Use secure, randomly generated passwords.

4. **CORS:**
   Configure allowed origins in production.

### Monitoring

1. **Vercel Analytics:**
   Automatically enabled for Vercel deployments.

2. **Error Tracking:**
   Consider integrating:
   - [Sentry](https://sentry.io) for error tracking
   - [LogRocket](https://logrocket.com) for session replay

3. **Performance Monitoring:**
   - Vercel Speed Insights
   - [New Relic](https://newrelic.com)
   - [Datadog](https://datadoghq.com)

### Backup Strategy

1. **Database Backups:**
   ```bash
   # Export database
   npx prisma db pull
   
   # Backup to file
   pg_dump DATABASE_URL > backup.sql
   ```

2. **Automated Backups:**
   Most providers offer automatic daily backups:
   - Vercel Postgres: Point-in-time recovery
   - Neon: Automatic backups every 24 hours
   - Supabase: Daily backups included

---

## Deployment Platforms

### Vercel (Recommended)

**Pros:**
- Zero-config Next.js deployment
- Automatic HTTPS and CDN
- Preview deployments for PRs
- Built-in analytics

**Steps:**
1. Push to GitHub
2. Import project on Vercel
3. Configure DATABASE_URL
4. Deploy

### Netlify

**Pros:**
- Simple deployment
- Good for static sites
- Free tier available

**Steps:**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables

### Railway

**Pros:**
- Includes database hosting
- Simple pricing
- Good developer experience

**Steps:**
1. Connect GitHub repository
2. Add PostgreSQL service
3. Railway auto-configures DATABASE_URL
4. Deploy

### Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t bmad-todo .
docker run -p 3000:3000 -e DATABASE_URL="..." bmad-todo
```

---

## CI/CD Pipeline

See [CI/CD documentation](./.github/workflows/test.yml) for GitHub Actions setup.

Typical pipeline:
1. **Lint** - ESLint checks
2. **Type Check** - TypeScript validation
3. **Test** - Jest unit and integration tests
4. **Build** - Next.js production build
5. **Deploy** - Automatic deployment on main branch

---

## Monitoring

### Health Checks

Create a health endpoint:

**`app/api/health/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      },
      { status: 503 }
    )
  }
}
```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Pingdom](https://pingdom.com) - Advanced monitoring
- [Better Uptime](https://betteruptime.com) - Modern uptime monitoring

---

## Troubleshooting

### Build Failures

**Issue:** Prisma Client not generated

**Solution:**
```bash
npx prisma generate
npm run build
```

**Issue:** TypeScript errors in build

**Solution:**
```bash
npm run type-check
# Fix any type errors before deploying
```

### Database Connection Issues

**Issue:** Connection timeout

**Solution:**
- Check DATABASE_URL format
- Verify database is accessible
- Check connection pooling settings

**Issue:** Migration failures

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### Runtime Errors

**Issue:** 500 errors on API routes

**Solution:**
- Check server logs
- Verify database connection
- Check Prisma Client generation

**Issue:** Client-side hydration errors

**Solution:**
- Ensure server and client render same content
- Check for browser-only APIs in server components

---

## Rollback Procedure

If a deployment has issues:

1. **Vercel:**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Promote to Production"

2. **Manual:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database:**
   - Restore from backup
   - Revert migrations if needed

---

## Performance Benchmarks

Expected performance on Vercel:
- **Cold start:** < 1s
- **Warm requests:** < 100ms
- **Database queries:** < 50ms
- **Page load:** < 2s (FCP)

Monitor with:
- Vercel Analytics
- Lighthouse CI
- WebPageTest

---

## Support

For deployment issues:
- Check [Vercel documentation](https://vercel.com/docs)
- Review [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Open an issue on GitHub

---

## Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database set up and migrated
- [ ] Build completes successfully
- [ ] Tests pass (`npm test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] Health endpoint accessible
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] HTTPS enabled
- [ ] Performance tested

---

**Last Updated:** 2026-02-24
