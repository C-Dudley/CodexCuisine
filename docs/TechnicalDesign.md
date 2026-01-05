1. System Overview
   This application is a full-stack monorepo designed to solve the "what's for dinner" problem through automated meal planning and intelligent grocery aggregation. It follows a Service-Oriented Architecture to ensure the web and future mobile platforms share the same business logic.

2. Architectural Decisions
   Monorepo Strategy
   Shared Package: We utilize `@codex-cuisine/shared` to house TypeScript interfaces and Zod schemas. This ensures 100% type-safety; if a database column changes in the backend, the frontend will throw a build error rather than a runtime error.

Prisma ORM: Chosen for its type-safe query builder, allowing us to map our ERD directly into TypeScript objects.

Database Design (ERD)
Our schema is optimized for Many-to-Many relationships.

Junction Tables: MealPlan and Favorite act as bridges to prevent data duplication.

Normalization: Ingredients are stored in a master table, allowing for "Smart Search" (e.g., searching for "Chicken" finds all recipes regardless of whether they list "Chicken Breast" or "Chicken Thighs").

3. Core Logic: Aggregation Engine
   The "Smart Shopping List" utilizes a grouping algorithm to reduce user friction:

Selection: All recipes within a date range are queried.

Standardization: Quantities are normalized based on serving size.

Consolidation: Ingredients are reduced to a Map<IngredientID, TotalQuantity> to merge duplicates across different meals.

4. State Management
   Server State: Handled via React Query. We treat the database as the "Source of Truth."

UI State: Drag-and-drop interactions are handled via @hello-pangea/dnd, with optimistic UI updates to ensure the app feels "instant" even on slower connections.

5. Security & Validation
   Authentication: Stateless JWT (JSON Web Tokens) stored in HttpOnly cookies to prevent XSS attacks.

Input Validation: All API boundaries are guarded by Zod schemas, ensuring no malformed data reaches the PostgreSQL layer.
