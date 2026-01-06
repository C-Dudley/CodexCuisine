# CodexCuisine Developer Setup Guide

This guide covers getting CodexCuisine running locally for development.

## System Requirements

- **Node.js**: 16.x or higher (18.x+ recommended)
- **npm**: 8.x or higher
- **Docker** & **Docker Compose** (optional, for PostgreSQL)
- **PostgreSQL**: 12+ (if not using Docker)
- **Git**: For version control

## Quick Start (Recommended with Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/C-Dudley/CodexCuisine.git
cd CodexCuisine
```

### 2. Install Dependencies

```bash
# Install root dependencies and all workspace packages
npm install
```

### 3. Set Up Environment Variables

#### Backend (.env)

Create `backend/.env`:

```bash
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codexcuisine"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
NODE_ENV="development"
PORT=3001

# CORS Configuration (for development)
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (.env)

Create `web/.env`:

```bash
# API Configuration
REACT_APP_API_URL="http://localhost:3001"

# Development mode
NODE_ENV="development"
```

### 4. Start Database with Docker

```bash
# Start PostgreSQL database
docker-compose -f docker/docker-compose.yml up -d postgres

# Wait 5-10 seconds for PostgreSQL to initialize
```

### 5. Initialize Database

```bash
cd backend

# Run migrations to create tables
npm run migrate

# Generate Prisma client
npm run generate

cd ..
```

### 6. Start Development Servers

```bash
# From root directory, start both backend and frontend concurrently
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

## Alternative Setup (Without Docker)

If you have PostgreSQL installed locally:

### 1. Configure PostgreSQL

```bash
# Create database
createdb codexcuisine

# Or using psql
psql -U postgres -c "CREATE DATABASE codexcuisine;"
```

### 2. Update Database URL

In `backend/.env`:

```bash
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/codexcuisine"
```

### 3. Run Migrations

```bash
cd backend
npm run migrate
npm run generate
cd ..
```

### 4. Start Servers Manually

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd web
npm start
```

## Environment Variables Reference

### Backend (backend/.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/codexcuisine` | ✓ |
| `JWT_SECRET` | Secret key for JWT signing | 32+ character random string | ✓ |
| `NODE_ENV` | Environment mode | `development`, `production` | ✓ |
| `PORT` | Server port | `3001` | - |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` | - |

### Frontend (web/.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3001` | ✓ |
| `NODE_ENV` | Environment mode | `development` | - |

## Common Commands

### Backend

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Build for production
npm run build

# Run database migrations
npm run migrate

# Generate Prisma client
npm run generate

# Open Prisma Studio (database GUI)
npm run studio

# Run TypeScript type check
npm run type-check

# Run tests
npm run test
```

### Frontend

```bash
cd web

# Start development server
npm start

# Build for production
npm run build

# TypeScript type check
npm run type-check

# Run tests
npm run test
```

### Root

```bash
# Start both backend and frontend
npm run dev

# Docker operations
npm run docker:up      # Start PostgreSQL via Docker
npm run docker:down    # Stop PostgreSQL

# Database operations
npm run migrate --workspace=backend
npm run generate --workspace=backend
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port (macOS/Linux)
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
# Docker:
docker ps | grep postgres

# Verify DATABASE_URL is correct in backend/.env
# Test connection:
psql $DATABASE_URL -c "SELECT 1"
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Regenerate Prisma client
cd backend && npm run generate && cd ..
```

### Frontend Blank Page

1. Check browser console for errors (F12)
2. Verify `REACT_APP_API_URL` in `web/.env`
3. Ensure backend is running on correct port
4. Clear browser cache (Ctrl+Shift+Delete)

## Database Reset

**⚠️ Warning: This deletes all data!**

```bash
cd backend

# Reset database (drop and recreate tables)
npx prisma migrate reset

cd ..
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: describe your changes"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## Next Steps

- Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint reference
- Check [ARCHITECTURE.md](./docs/ArchitectureDiagram.md) for system design
- Review [CODE_STYLE.md](./CODE_STYLE.md) for project conventions

## Getting Help

- Check existing issues on GitHub
- Review logs with `npm run dev` for error messages
- Post detailed questions with logs and error messages

## Security Notes

- **Never commit `.env` files** containing secrets
- Use strong JWT_SECRET (32+ characters)
- Change default database credentials in production
- Use HTTPS in production
- Validate all user inputs server-side
- Keep dependencies updated: `npm audit fix`

