# Recipe Discovery

## Overview

The Recipe Discovery feature allows users to search and browse recipes from external sources (AllRecipes, Food Network). Users can search by keyword, filter by source site, and view detailed recipe information including ingredients, cook time, and servings. The feature integrates with the user's dietary preferences to highlight safe recipes and warn about allergens.

## Endpoints

- **GET `/api/external-recipes`** — Search external recipes
  - Query Parameters: `query`, `sourceSite`, `limit`, `offset`, `userId` (optional for filtering)
  - Returns: Array of ExternalRecipe objects with `safeForUser` and `allergenWarning` flags
- **POST `/api/external-recipes/scrape`** — Scrape a recipe from a URL
  - Body: `{ "url": string }`
  - Returns: 201 Created with ExternalRecipe object and externalIngredients array

## Logic Flow

**Search & Browse:**

1. User navigates to `/discover` route → DiscoverPage component
2. User enters search term and optionally selects source site
3. Frontend calls `GET /api/external-recipes?query=...&sourceSite=...&userId=...`
4. Backend queries ExternalRecipe table, applies dietary filters if userId provided
5. Returns recipes with `safeForUser: true/false` and `allergenWarning` if present
6. DiscoverPage displays recipe cards with:
   - Recipe image, title, description
   - Cook time, servings, ingredients preview
   - Green "✓ Safe for you" badge OR red "⚠️ [allergen]" warning badge
   - Source site badge (AllRecipes, Food Network)
   - "View Source" button (links to original recipe URL)
   - "Add to Plan" quick action button

**Recipe Import:**

1. When `/scrape` endpoint is called with a URL:
2. Backend routes to appropriate scraper (AllRecipes, FoodNetwork, or unsupported)
3. Scraper fetches HTML and extracts Recipe JSON-LD schema
4. Parses ingredients with quantities/units, instructions, cook time, servings
5. Creates ExternalRecipe database entry with full metadata
6. Creates ExternalIngredient entries for each ingredient
7. Returns 201 with complete recipe object

## Data Model

- **ExternalRecipe** — Stores scraped recipes with title, description, cook time, servings, imageUrl, sourceUrl, sourceSite, full instructions
- **ExternalIngredient** — Stores parsed ingredients (name, quantity, unit) linked to ExternalRecipe
- **DietaryPreference** — User preferences (vegan, vegetarian, keto, etc.) used to flag safe recipes
- **Allergy** — User allergens used to warn about unsafe ingredients

## State Management

- **DiscoverPage.tsx** — Local `useState` for:
  - `searchQuery` — Current search text
  - `selectedSource` — Chosen source site filter
  - `recipes` — Array of search results
  - `loading` — Fetch in progress
  - `error` — Error message
  - `hasSearched` — Whether user has performed a search
- No React Query or caching (can be added for optimization)
- Mock user ID hardcoded to "mock-user-id-123" (will connect to auth context in Phase 8)
- Mock fallback data for demo when API errors occur

## Example Usage

**Search External Recipes:**

```bash
GET /api/external-recipes?query=carbonara&sourceSite=AllRecipes&userId=mock-user-id-123

Response:
{
  "items": [
    {
      "id": "ext-123",
      "title": "Classic Spaghetti Carbonara",
      "description": "Traditional Italian pasta...",
      "cookTime": 20,
      "servings": 4,
      "imageUrl": "https://...",
      "sourceSite": "AllRecipes",
      "sourceUrl": "https://www.allrecipes.com/recipe/...",
      "safeForUser": true,
      "allergenWarning": null,
      "externalIngredients": [
        { "id": "ing-1", "name": "Spaghetti", "quantity": 1, "unit": "lb" },
        { "id": "ing-2", "name": "Eggs", "quantity": 4, "unit": "count" }
      ]
    }
  ],
  "total": 42
}
```

**Scrape Recipe from URL:**

```bash
POST /api/external-recipes/scrape
Body: { "url": "https://www.allrecipes.com/recipe/12345/carbonara/" }

Response: 201 Created
{
  "id": "ext-456",
  "title": "Classic Spaghetti Carbonara",
  "description": "Traditional Italian pasta...",
  "instructions": "1. Bring water to boil...",
  "cookTime": 20,
  "servings": 4,
  "imageUrl": "https://...",
  "sourceSite": "AllRecipes",
  "sourceUrl": "https://www.allrecipes.com/recipe/12345/carbonara/",
  "externalIngredients": [
    { "id": "ing-1", "name": "Spaghetti", "quantity": 1, "unit": "lb" },
    { "id": "ing-2", "name": "Eggs", "quantity": 4, "unit": "count" }
  ]
}
```

## Frontend Features

- **Search Bar** — Auto-focus, large text, respects color theme (orange/yellow gradient)
- **Source Filter** — Dropdown to filter by AllRecipes, Food Network, or all sites
- **Recipe Cards** — Grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
  - Image with source badge and allergen/safety badges
  - Title, description (line-clamped to 2 lines)
  - Cook time + servings meta info
  - Ingredients list (preview of first 3, "+X more")
  - "View Source" and "Add to Plan" buttons
- **Empty States** — Large icon + message when no recipes or no search yet
- **Error Handling** — Red error banner with fallback mock data for demo
- **Loading State** — Spinner in search button during API call

## UI Design

- **Color Scheme** — Orange/yellow gradient background, white cards, green for safe recipes, red for allergen warnings
- **Typography** — Large search box (18px), recipe titles (18px), ingredient text (12px), button text (14px)
- **Icons** — lucide-react icons for search, filter, plus (add), and alert
- **Responsive** — Tailwind grid: 1 col mobile, 2 col tablet, 3 col desktop; hidden mobile nav until phase 9

## Future Enhancement Ideas

- React Query integration for caching search results and invalidation
- Save external recipes to user collections (TODO: "Add to Plan" button implementation)
- Batch scrape multiple URLs
- Custom recipe website support via regex + JSON-LD fallback
- Recipe rating/review from external sources
- Social sharing integration
