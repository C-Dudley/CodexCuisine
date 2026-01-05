# Copilot / AI Agent Instructions — Recipe App

Quick, targeted guidance to make AI coding agents productive in this repository.

- Big picture

  - Monorepo with `backend/`, `web/`, `shared/`, and `mobile/` (placeholder).
  - `backend` is an Express + TypeScript API using Prisma (SQLite in local dev, PostgreSQL in production). Key entry: `backend/src/server.ts`.
  - `web` is a React + TypeScript SPA (Create React App / react-scripts) that talks to the backend at `/api/*`.
  - Shared types live in `shared/src` and should be used to keep DTOs consistent.

- Important files to inspect first

  - Backend routes: `backend/src/routes/recipes.ts`, `backend/src/routes/meal-plan.ts`
  - Prisma schema: `backend/prisma/schema.prisma`
  - Shopping list generator: `backend/src/services/shoppingList.ts`
  - HTTP server + middleware: `backend/src/server.ts`, `backend/src/middleware/errorHandler.ts`
  - Frontend pages/components: `web/src/pages/HomePage.tsx`, `web/src/pages/RecipePage.tsx`, `web/src/pages/MealPlanPage.tsx`, `web/src/components/MealPlanChart.tsx`
  - Shared types: `shared/src/types.ts`
  - Docker setup: `docker/docker-compose.yml`

- Architectural patterns & why

  - Routes are organized by feature under `backend/src/routes`. Each route file uses Zod for input validation then calls Prisma. Example: `recipes.ts` validates inputs with Zod, calls `prisma.recipe.findMany` and `include` to load `ingredientLists` and `ingredient` relations.
  - Prisma models drive API shapes. Routes use `include` to fetch related data (see `ingredientLists` join table pattern in `schema.prisma`). Keep Prisma includes in mind when matching frontend expectations.
  - Frontend mixes direct axios calls and React Query: `HomePage` uses axios directly; `MealPlanPage` uses `@tanstack/react-query` for caching and mutation invalidation (see `MealPlanChart` mutation that invalidates `meal-plans`).
  - Authorization is assumed in routes (e.g., `meal-plan.ts` checks `req.user`). The auth middleware isn't present in the files scanned — treat `req.user` as required by those endpoints and avoid changing security assumptions without confirming.

- Developer workflows (how to run & debug)

  - Root dev (concurrently runs backend + web):
    ```bash
    npm run dev
    ```
  - Backend only:
    ```bash
    cd backend
    npm run dev           # nodemon src/server.ts
    npm run build         # tsc -> dist/
    npm run migrate       # npx prisma migrate dev
    npm run generate      # npx prisma generate
    npm run studio        # npx prisma studio
    npx tsc --noEmit      # quick type-check
    ```
  - Web only:
    ```bash
    cd web
    npm start             # react-scripts start
    npm run build
    npm run type-check    # tsc --noEmit
    ```
  - Docker (recommended dev stack in README):

    ````bash
    npm run docker:up
    # Copilot / AI Agent Instructions — Recipe App

    Quick, targeted guidance to make AI coding agents productive in this repository.

    - Big picture

      - Monorepo with `backend/`, `web/`, `shared/`, and `mobile/` (placeholder).
      - `backend` is an Express + TypeScript API using Prisma (SQLite in local dev, PostgreSQL in production). Key entry: `backend/src/server.ts`.
      - `web` is a React + TypeScript SPA (Create React App / react-scripts) that talks to the backend at `/api/*`.
      - Shared types live in `shared/src` and should be used to keep DTOs consistent.

    - Important files to inspect first

      - Backend routes: `backend/src/routes/recipes.ts`, `backend/src/routes/meal-plan.ts`
      - Prisma schema: `backend/prisma/schema.prisma`
      - Shopping list generator: `backend/src/services/shoppingList.ts`
      - HTTP server + middleware: `backend/src/server.ts`, `backend/src/middleware/errorHandler.ts`
      - Frontend pages/components: `web/src/pages/HomePage.tsx`, `web/src/pages/RecipePage.tsx`, `web/src/pages/MealPlanPage.tsx`, `web/src/components/MealPlanChart.tsx`
      - Shared types: `shared/src/types.ts`
      - Docker setup: `docker/docker-compose.yml`

    - Architectural patterns & why

      - Routes are organized by feature under `backend/src/routes`. Each route file uses Zod for input validation then calls Prisma. Example: `recipes.ts` validates inputs with Zod, calls `prisma.recipe.findMany` and `include` to load `ingredientLists` and `ingredient` relations.
      - Prisma models drive API shapes. Routes use `include` to fetch related data (see `ingredientLists` join table pattern in `schema.prisma`). Keep Prisma includes in mind when matching frontend expectations.
      - Frontend mixes direct axios calls and React Query: `HomePage` uses axios directly; `MealPlanPage` uses `@tanstack/react-query` for caching and mutation invalidation (see `MealPlanChart` mutation that invalidates `meal-plans`).
      - Authorization is assumed in routes (e.g., `meal-plan.ts` checks `req.user`). The auth middleware isn't present in the files scanned — treat `req.user` as required by those endpoints and avoid changing security assumptions without confirming.

    - Developer workflows (how to run & debug)

      - Root dev (concurrently runs backend + web):
        ```bash
        npm run dev
        ```
      - Backend only:
        ```bash
        cd backend
        npm run dev           # nodemon src/server.ts
        npm run build         # tsc -> dist/
        npm run migrate       # npx prisma migrate dev
        npm run generate      # npx prisma generate
        npm run studio        # npx prisma studio
        npx tsc --noEmit      # quick type-check
        ```
      - Web only:
        ```bash
        cd web
        npm start             # react-scripts start
        npm run build
        npm run type-check    # tsc --noEmit
        ```
      - Docker (recommended dev stack in README):
        ```bash
        npm run docker:up
        docker-compose -f docker/docker-compose.yml up -d postgres
        ```
      - API quick health check: `GET /health` on the backend port (defaults to 3001).

    - Project-specific conventions & patterns

      - Validation: Zod schemas are declared in each route file (e.g., `createRecipeSchema` in `recipes.ts`). Mirror these shapes when producing requests.
      - Prisma includes: API responses commonly include nested relations using `include: { ingredientLists: { include: { ingredient: true } } }`. Frontend components expect this nested structure (see `HomePage`/`RecipePage`).
      - Endpoint prefixes: API routes are mounted as `app.use('/api/recipes', recipeRoutes)` and `app.use('/api/meal-plan', mealPlanRoutes)` in `server.ts`. Use those base paths for requests.
      - Shopping list: The shopping list logic is a backend service that accepts an array of meal plan IDs and returns categorized aggregated items (`generateShoppingList` in `shoppingList.ts`). Uses `ingredient.unit` to group/summarize quantities.
      - Error handling: Use `errorHandler` and `notFound` middleware patterns in `backend/src/middleware/errorHandler.ts` when modifying routes.

    - Tests & static checks

      - Backend tests use `jest` (script `npm run test` in `backend`).
      - Type checking available via `npx tsc --noEmit` (backend) and `npm run type-check` (web).

    - Integration points & external deps

      - Prisma (`@prisma/client`) and migrations control DB schema. Run `npm run migrate` and `npm run generate` after schema changes.
      - Postgres is used in production Docker compose; local dev may use SQLite (`backend/prisma/schema.prisma` datasource can be switched).
      - Frontend uses `axios` for HTTP and `@tanstack/react-query` for caching mutations in meal planning.

    - Safe modification rules for agents

      - Don't change Prisma model primary keys or relation names without updating all `findMany`/`include` queries and the frontend response expectations.
      - Preserve Zod validation shapes when editing routes — tests and frontend depend on these contracts.
      - When adding new backend endpoints, update `backend/src/server.ts` to mount the route and include error handling.
      - For UI changes, prefer reading `shared/src/types.ts` and aligning props/data shapes with Prisma includes to avoid runtime mismatches.

    - Quick examples (how to add a new recipe endpoint handler)
      - Check `backend/src/routes/recipes.ts` for patterns: use Zod for input, `prisma.recipe.create` with `include` for nested data, and return `201` for created resources.

    ---

    Please review and tell me if you want more detail on any section (examples, exact request/response shapes, or missing integration points). I can iterate the document with additional file-level examples or a short checklist for common agent tasks (add route, update UI, run migrations).

    ## Agent Task: Reverse-engineer features -> docs/notes

    When asked to generate technical notes from the codebase, follow these exact steps:

    - Scan `backend/src` and `web/src` for implemented features and matching route/components. Prioritize files listed under "Important files to inspect first".
    - For each discovered feature create one Markdown file in `docs/notes/` named `<feature>.md` (e.g., `recipe-crud.md`, `meal-planning.md`, `shopping-list.md`, `auth.md`).
    - Each feature file must include the following sections:
      - **Overview:** one-paragraph summary of what the feature does.
      - **Endpoints:** list concrete API routes involved (full paths mounted in `server.ts`).
      - **Logic Flow:** describe the request/response flow between frontend and backend, mentioning specific files (e.g., `web/src/pages/HomePage.tsx` -> `backend/src/routes/recipes.ts`).
      - **Data Model:** list relevant Prisma models from `backend/prisma/schema.prisma` (e.g., `Recipe`, `IngredientList`, `Ingredient`, `MealPlan`, `Favorite`, `User`).
      - **State Management:** note how UI keeps data in sync (e.g., React Query keys, local `useState`, or direct axios calls). Cite source files when possible.
      - **Output:** save the generated markdown to `docs/notes/<feature>.md` and include a short example snippet (one request/response example) when available.

    Rules for agents generating these notes:

    - Use only discoverable information from the repo — do not invent endpoints or models.
    - When referencing files, use exact repository-relative paths wrapped in backticks (e.g., `backend/src/routes/recipes.ts`).
    - If multiple frontend files consume the same endpoint, mention them all (e.g., `HomePage.tsx` and `RecipePage.tsx`).
    - After creating notes, add the task to the repository TODO list (use `manage_todo_list`) and prompt the user for feedback.

    Example: "Recipe CRUD" note should reference `web/src/pages/HomePage.tsx`, `web/src/pages/RecipePage.tsx`, `backend/src/routes/recipes.ts`, `backend/prisma/schema.prisma`, and mention that `HomePage` uses axios directly while `MealPlanPage` uses React Query.

    ---

    If you'd like, I can now (A) generate a complete set of feature notes based on the code I scanned, or (B) only add the task checklist for you to review. Which do you prefer?

    ## Lead Architect: Agent Role & Project Rules

    Role: You are a Senior Full-Stack Engineer acting as the Lead Architect for this repo.

    Project Context: I am building a Recipe & Meal Planning monorepo (Yummly-inspired).

    Structure: `backend/` (Node/Express/Prisma), `web/` (React/Tailwind/@tanstack/react-query), `shared/` (TypeScript types). `mobile/` is a placeholder.

    Database: PostgreSQL in production; the repo currently uses SQLite for local dev (`backend/prisma/schema.prisma`).

    Design Docs: All architecture artifacts live in `/docs` (ERDs, sequence diagrams, and feature notes).

    Source of Truth:

    - Database schema: `backend/prisma/schema.prisma`
    - Shared types: `shared/src/types.ts`
    - Implementation progress / feature notes: `docs/notes/`

    Your Instructions (strict):

    - Analyze before coding: Before suggesting any code changes, inspect existing patterns for validation (`Zod`), styling (`Tailwind`), and data fetching (`@tanstack/react-query` / `axios`). Reference the exact files that demonstrate the pattern (e.g., `backend/src/routes/recipes.ts`, `web/src/components/MealPlanChart.tsx`).

    - Type Safety: Always use and prefer the types defined in `shared/src`. If you need new types, add them to `shared/src` and update any dependent code and `docs/notes/<feature>.md`.

    - Documentation: For every non-trivial change (new route, changed response shape, DB migration), state which file in `docs/notes/` must be updated and include a short summary of the required doc changes.

    - No Spaghetti: Do not propose quick hacks that bypass validation, typing, or schema constraints. If a change requires a database migration, explicitly call it out, update `backend/prisma/schema.prisma`, and add a `docs/notes/<feature>.md` entry describing the migration and rationale.

    These rules are authoritative for AI agents operating in this repo — follow them to keep the codebase consistent and safe.
    ````
