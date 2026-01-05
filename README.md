# Recipe App 🍳

A modern, self-hosted recipe application inspired by Yummly. Built with a monorepo structure supporting both web and mobile platforms.

## Features

- 🔍 **Recipe Discovery**: Search and browse thousands of recipes
- 👨‍🍳 **Recipe Management**: Create, edit, and organize your recipes
- 📱 **Cross-Platform**: Web app with mobile app support
- 🏷️ **Collections**: Organize recipes into custom collections
- ⭐ **Ratings & Reviews**: Rate and review recipes
- 📅 **Meal Planning**: Plan your meals for the week
- 🔒 **User Authentication**: Secure user accounts and profiles
- 🐳 **Self-Hosted**: Easy deployment with Docker

## Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication
- **Zod** for validation
- **bcrypt** for password hashing

### Frontend (Web)

- **React** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for forms

### Mobile (Future)

- **React Native** with TypeScript
- Shared business logic with web app

### DevOps

- **Docker** & Docker Compose for containerization
- **Nginx** reverse proxy for production

## Project Structure

```
recipe-app-monorepo/
├── backend/           # Node.js/Express API server
│   ├── prisma/        # Database schema and migrations
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/# Custom middleware
│   │   └── server.ts  # Main server file
│   └── package.json
├── web/               # React web application
│   ├── src/
│   │   ├── components/# Reusable components
│   │   ├── pages/     # Page components
│   │   └── App.tsx    # Main app component
│   └── package.json
├── mobile/            # React Native mobile app (placeholder)
├── shared/            # Shared TypeScript types
├── docker/            # Docker configuration
└── package.json       # Monorepo root
```

## System Design

### Database Schema (ERD)

The following diagram represents our database structure, managed via Prisma.

```mermaid
    erDiagram
USER ||--o{ MEAL_PLAN : "schedules"
USER ||--o{ FAVORITE : "saves"

    MEAL_PLAN }o--|| RECIPE : "contains"
    FAVORITE }o--|| RECIPE : "references"

    RECIPE ||--|{ INGREDIENT_LIST : "lists"
    INGREDIENT_LIST ||--|| INGREDIENT : "uses"

    USER {
        string id PK
        string email
    }
    MEAL_PLAN {
        string id PK
        string u_id FK
        string r_id FK
        date day
    }
    FAVORITE {
        string id PK
        string u_id FK
        string r_id FK
    }
    RECIPE {
        string id PK
        string title
    }
    INGREDIENT_LIST {
        string id PK
        string r_id FK
        string i_id FK
    }
    INGREDIENT {
        string id PK
        string name
    }
```

### Meal Planning Logic

This sequence diagram illustrates how a recipe is added to the plan and triggers a shopping list update.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Mobile/Web UI
    participant Server as Backend API
    participant DB as Database

    User->>App: Add Recipe to Plan
    App->>Server: POST /api/meal-plan
    Server->>DB: Insert MEAL_PLAN
    Server->>DB: Fetch Ingredients
    DB-->>Server: Return List
    Server->>DB: Add to SHOPPING_LIST
    Server-->>App: 200 OK
    App->>User: Update UI
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd recipe-app
   ```

````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the backend environment template:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/recipe_app"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Start with Docker (Recommended)**

   ```bash
   # Start all services
   npm run docker:up

   # Or for development
   docker-compose -f docker/docker-compose.yml up -d postgres
   npm run dev
   ```

5. **Manual setup (Alternative)**

   - Start PostgreSQL database
   - Run database migrations: `npm run migrate --workspace=backend`
   - Generate Prisma client: `npm run generate --workspace=backend`
   - Start backend: `npm run dev --workspace=backend`
   - Start web app: `npm run dev --workspace=web`

### Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs (future feature)

## Development

### Available Scripts

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev

# Build all packages
npm run build

# Run tests
npm test

# Database operations (backend workspace)
npm run migrate --workspace=backend
npm run generate --workspace=backend
npm run studio --workspace=backend
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Recipes

- `GET /api/recipes` - Get all recipes (with search/filters)
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

#### Collections

- `GET /api/collections` - Get user's collections
- `POST /api/collections` - Create collection
- `GET /api/collections/:id` - Get collection by ID
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/recipes` - Add recipe to collection
- `DELETE /api/collections/:id/recipes/:recipeId` - Remove recipe from collection

#### Users

- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/recipes` - Get user's recipes
- `GET /api/users/:id/collections` - Get user's collections

## Deployment

### Production with Docker

1. **Build and deploy**

   ```bash
   docker-compose -f docker/docker-compose.yml --profile production up -d
   ```

2. **Access your app**
   - Web App: http://your-server-ip
   - API: http://your-server-ip/api

### Environment Variables for Production

Update your `backend/.env` with production values:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/recipe_app"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="https://your-domain.com"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced search with filters
- [ ] Recipe import from URLs
- [ ] Shopping list generation
- [ ] Social features (following, sharing)
- [ ] Recipe recommendations
- [ ] Admin panel
- [ ] API documentation with Swagger
- [ ] Email notifications
- [ ] Recipe scaling (servings)
- [ ] Nutritional information
- [ ] Recipe timers and cooking modes

## Support

If you have any questions or need help, please open an issue on GitHub.
````
