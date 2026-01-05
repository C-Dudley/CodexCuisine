# Recipe CRUD

## Overview

The Recipe CRUD feature provides full create, read, update, and delete operations for recipes. Users can browse recipes with search and pagination, view detailed recipe information, and manage recipe data through a RESTful API.

## Endpoints

- `GET /api/recipes` - List recipes with optional search and pagination
- `GET /api/recipes/:id` - Get single recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update existing recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Logic Flow

1. **Frontend Request**: HomePage component makes axios GET request to `/api/recipes` with query parameters for search and pagination
2. **Backend Processing**: Express route validates query parameters using Zod schema, queries Prisma with filters and includes ingredient lists
3. **Database Query**: Prisma fetches recipes with related ingredient data, applies pagination
4. **Response**: JSON response with recipes array and pagination metadata
5. **Frontend Rendering**: React component displays recipe cards with title, cook time, and ingredient count

## Data Model

- **Recipe**: Core entity with title, instructions, cookTime
- **IngredientList**: Junction table linking recipes to ingredients with quantities
- **Ingredient**: Reusable ingredient definitions with name, unit, category

## State Management

- **Local State**: useState for search query, current page, loading states
- **No External State**: Uses direct API calls without React Query for simplicity
- **Error Handling**: Try/catch with fallback to empty array on API failure
