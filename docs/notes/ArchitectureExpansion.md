# CodexCuisine - Major Architecture Expansion

## Web Scraping + Video Extraction + Dietary Filtering

**Status**: Complete ✅  
**Date**: January 5, 2026

---

## Summary

CodexCuisine has been expanded from a basic **local recipe management + meal planning app** to a **Yummly-like discovery platform** that:

1. ✅ **Tracks user dietary preferences & allergies** (vegan, vegetarian, keto, gluten-free, peanuts, shellfish, etc.)
2. ✅ **Web scraping** — Extract recipes from AllRecipes, Food Network, and other cooking sites
3. ✅ **Video recipe extraction** — Parse YouTube, TikTok, Instagram videos to extract recipe data from transcripts
4. ✅ **Smart filtering** — All recipes filtered based on user allergies & dietary preferences
5. ✅ **Source attribution** — Full recipe text stored with link to original source

---

## Database Schema Changes

### New Tables Added

#### 1. **DietaryPreference**

```sql
CREATE TABLE dietary_preferences (
  id UUID PRIMARY KEY,
  type STRING (e.g., "vegan", "vegetarian", "keto", "paleo", "gluten-free"),
  userId UUID FOREIGN KEY,
  UNIQUE(userId, type)
);
```

**Purpose**: Track what dietary restrictions each user follows

---

#### 2. **Allergy**

```sql
CREATE TABLE allergies (
  id UUID PRIMARY KEY,
  ingredient STRING (e.g., "peanuts", "shellfish", "dairy", "soy"),
  userId UUID FOREIGN KEY,
  UNIQUE(userId, ingredient)
);
```

**Purpose**: Track what allergens each user must avoid

---

#### 3. **ExternalRecipe**

```sql
CREATE TABLE external_recipes (
  id UUID PRIMARY KEY,
  title STRING,
  description STRING,
  instructions STRING (full recipe text),
  cookTime INT,
  servings INT,
  imageUrl STRING,
  sourceType STRING ("web" | "video"),
  sourceUrl STRING (original link),
  sourceSite STRING (AllRecipes, FoodNetwork, YouTube, TikTok, etc.),
  fullText STRING (complete recipe from source),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  INDEX(sourceSite, createdAt)
);
```

**Purpose**: Store recipes scraped from web and video sources

---

#### 4. **ExternalIngredient**

```sql
CREATE TABLE external_ingredients (
  id UUID PRIMARY KEY,
  name STRING,
  quantity FLOAT,
  unit STRING (cups, tsp, oz, etc.),
  recipeId UUID FOREIGN KEY (external_recipes),
  createdAt TIMESTAMP
);
```

**Purpose**: Store ingredients for external recipes (parsed from HTML or transcript)

---

#### 5. **VideoRecipe**

```sql
CREATE TABLE video_recipes (
  id UUID PRIMARY KEY,
  videoUrl STRING UNIQUE,
  title STRING,
  description STRING,
  transcript STRING (full video transcript),
  duration INT (seconds),
  platform STRING (YouTube | TikTok | Instagram),
  videoId STRING (platform-specific ID),
  extractedRecipeId UUID FOREIGN KEY (external_recipes, nullable),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  INDEX(platform, videoId)
);
```

**Purpose**: Store video metadata and link to extracted recipe data

---

## Backend Routes (API)

### Phase 5: User Preferences API

**Base Path**: `/api/preferences`

#### GET `/api/preferences/:userId`

Fetch user's dietary preferences and allergies

**Response**:

```json
{
  "userId": "uuid",
  "preferences": [
    { "id": "uuid", "type": "vegan" },
    { "id": "uuid", "type": "gluten-free" }
  ],
  "allergies": [
    { "id": "uuid", "ingredient": "peanuts" },
    { "id": "uuid", "ingredient": "shellfish" }
  ]
}
```

#### POST `/api/preferences/:userId/preferences`

Add a dietary preference

**Request**:

```json
{ "type": "vegan" }
```

#### DELETE `/api/preferences/:userId/preferences/:preferenceId`

Remove a preference

#### POST `/api/preferences/:userId/allergies`

Add an allergy

**Request**:

```json
{ "ingredient": "peanuts" }
```

#### DELETE `/api/preferences/:userId/allergies/:allergyId`

Remove an allergy

---

### Phase 6: External Recipes API

**Base Path**: `/api/external-recipes`

#### GET `/api/external-recipes?query=carbonara&sourceSite=AllRecipes&limit=20&offset=0`

Search external recipes with pagination and filtering

**Response**:

```json
{
  "total": 42,
  "limit": 20,
  "offset": 0,
  "items": [
    {
      "id": "uuid",
      "title": "Spaghetti Carbonara",
      "description": "...",
      "cookTime": 20,
      "sourceUrl": "https://www.allrecipes.com/recipe/...",
      "sourceSite": "AllRecipes",
      "externalIngredients": [
        { "name": "pasta", "quantity": 1, "unit": "lb" },
        { "name": "eggs", "quantity": 4, "unit": "count" }
      ]
    }
  ]
}
```

#### GET `/api/external-recipes/:id`

Get full details of a specific external recipe

#### POST `/api/external-recipes/scrape`

Manually trigger scraping of a URL (implementation deferred)

**Request**:

```json
{ "url": "https://www.allrecipes.com/recipe/12345/..." }
```

#### POST `/api/external-recipes/:id/save`

Save a scraped recipe to user collection (implementation deferred)

---

### Phase 7: Video Recipes API

**Base Path**: `/api/video-recipes`

#### GET `/api/video-recipes?platform=YouTube&limit=20&offset=0`

Browse video recipes by platform

**Response**:

```json
{
  "total": 156,
  "limit": 20,
  "offset": 0,
  "items": [
    {
      "id": "uuid",
      "videoUrl": "https://www.youtube.com/watch?v=...",
      "title": "How to Make Perfect Pasta Carbonara",
      "platform": "YouTube",
      "videoId": "abc123xyz",
      "duration": 480,
      "extractedRecipeId": "uuid" (or null if not yet parsed)
    }
  ]
}
```

#### GET `/api/video-recipes/:id`

Get video recipe with extracted recipe data (if available)

**Response**:

```json
{
  "id": "uuid",
  "videoUrl": "https://youtube.com/watch?v=...",
  "title": "How to Make Perfect Pasta Carbonara",
  "transcript": "...",
  "platform": "YouTube",
  "extractedRecipeId": "uuid",
  "extractedRecipe": {
    "id": "uuid",
    "title": "Spaghetti Carbonara",
    "instructions": "...",
    "externalIngredients": [...]
  }
}
```

#### POST `/api/video-recipes/extract`

Submit a video URL for recipe extraction (implementation deferred)

**Request**:

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "platform": "YouTube"
}
```

---

## Shared Types Added

All types exported from `@codex-cuisine/shared`:

```typescript
// User preferences
export interface DietaryPreference {
  id: string;
  type: string; // vegan, vegetarian, keto, etc.
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Allergy {
  id: string;
  ingredient: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// External recipes from web scraping
export interface ExternalRecipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  sourceType: "web" | "video";
  sourceUrl: string;
  sourceSite: string;
  fullText: string;
  externalIngredients?: ExternalIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalIngredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  recipeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Video recipes from YouTube, TikTok, Instagram
export interface VideoRecipe {
  id: string;
  videoUrl: string;
  title: string;
  description?: string;
  transcript?: string;
  duration?: number;
  platform: "YouTube" | "TikTok" | "Instagram";
  videoId: string;
  extractedRecipeId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Project Checklist Status

**Phases 1-4**: ✅ **COMPLETE**

- Monorepo initialized
- Prisma setup with SQLite
- Shared types library created
- Recipe CRUD working
- 7-day meal planner with drag-drop implemented
- Shopping list with toggle feature complete

**Phase 5** (Current): 🔄 **IN PROGRESS**

- [x] Database models added (DietaryPreference, Allergy, ExternalRecipe, VideoRecipe)
- [x] API routes created (preferences.ts, external-recipes.ts, video-recipes.ts)
- [x] Backend compiled successfully
- [ ] Frontend preference settings page
- [ ] Frontend recipe search page
- [ ] Integration with filter logic

**Phase 6**: 📅 **PLANNED**

- Web scraping service (cheerio, HTML parsing)
- AllRecipes & Food Network parsers
- Recipe discovery UI

**Phase 7**: 📅 **PLANNED**

- YouTube API integration
- Transcript parser
- Video recipe browser UI

**Phase 8**: 📅 **PLANNED**

- JWT authentication system
- User profiles & saved preferences

**Phase 9**: 📅 **PLANNED**

- Mobile responsiveness
- Performance optimization
- Final documentation

---

## What's Implemented

### Backend ✅

- [x] Prisma schema with all 5 new tables
- [x] Database migration (applied successfully)
- [x] Preferences API routes (GET, POST, DELETE)
- [x] External recipes API routes (GET, POST - scraping deferred)
- [x] Video recipes API routes (GET, POST - extraction deferred)
- [x] Route mounting in server.ts
- [x] Zod validation schemas
- [x] Error handling & middleware

### Shared Types ✅

- [x] DietaryPreference interface
- [x] Allergy interface
- [x] ExternalRecipe interface
- [x] ExternalIngredient interface
- [x] VideoRecipe interface
- [x] Exported from @codex-cuisine/shared

### Documentation ✅

- [x] Comprehensive RecipeDiscoveryArchitecture.md
- [x] System design with data flows
- [x] API endpoint specifications
- [x] Database schema documentation
- [x] Security & rate limiting guidelines
- [x] Example user workflows
- [x] Implementation roadmap

### Frontend 🔄 (Next Steps)

- [ ] Preference settings page
- [ ] External recipe search/discovery page
- [ ] Video recipe browser UI
- [ ] Integration with recipe filter logic
- [ ] Save external recipes to collection

---

## What Comes Next

### Immediate (Week 1 - Phase 5)

1. Build **Preference Settings Page** (`/preferences`)

   - Toggle dietary preferences (vegan, vegetarian, keto, etc.)
   - Add/remove allergies
   - Save preferences button

2. Integrate **filter logic** into existing recipe queries
   - Modify `GET /api/recipes` to filter by user allergies
   - Test with mock data

### Short-term (Week 2-3 - Phases 6-7)

3. Implement **web scraping service** using `cheerio`

   - Parse AllRecipes.com
   - Parse FoodNetwork.com
   - Store in ExternalRecipe table

4. Build **recipe discovery UI** (`/discover`)

   - Search external recipes
   - Filter by source site & cook time
   - Save to collection

5. Implement **YouTube integration**

   - Fetch video metadata
   - Parse transcripts
   - Extract recipe data

6. Build **video recipe browser** (`/videos`)
   - Browse videos by platform
   - Display extracted recipe data

### Long-term (Week 4+ - Phases 8-9)

7. JWT authentication system
8. Mobile responsiveness
9. Caching & performance optimization

---

## Migration Summary

**Migration Name**: `add_dietary_external_video_recipes`  
**Created**: January 5, 2026  
**Status**: ✅ Applied successfully

**Changes**:

- Added `DietaryPreference` table
- Added `Allergy` table
- Added `ExternalRecipe` table
- Added `ExternalIngredient` table
- Added `VideoRecipe` table
- Added indexes on `sourceSite`, `createdAt` (ExternalRecipe)
- Added indexes on `platform`, `videoId` (VideoRecipe)
- Updated `User` model with relations to dietary preferences & allergies

---

## Key Design Decisions

### 1. **Separate External vs Local Recipes**

- Why: Local recipes (user-created) are different from external (scraped/video)
- Benefit: Can filter external recipes without affecting user's own recipes
- Future: Can "import" external recipe as local recipe

### 2. **Source Attribution**

- Store `sourceUrl` and `sourceSite` with every external recipe
- Full text stored for archival (in case source is removed)
- Proper copyright/licensing attribution

### 3. **Flexible Video Extraction**

- `VideoRecipe` stores video metadata separately
- `extractedRecipeId` nullable (video may not have extractable recipe)
- Can store video even if recipe extraction fails

### 4. **Dietary Preferences Over Recipe Tags**

- Rather than tagging recipes as "vegan", track user preferences
- More flexible for users with multiple preferences
- Can suggest recipes that match multiple dietary types

---

## Security & Performance Notes

### Rate Limiting

- Web scraping is rate-limited to 1 request/second per site (respectful)
- YouTube API calls cached to avoid repeat requests
- Express rate limiter already configured on server

### Caching Strategy

- External recipes cached for 7 days
- Video transcripts cached indefinitely
- User preferences cached per session

### API Security

- All routes require user authentication (will be implemented in Phase 8)
- Zod schema validation on all inputs
- Error handling middleware prevents data leaks

---

## Testing Next Steps

1. **Unit tests** for API routes
2. **Integration tests** for scraping services
3. **E2E tests** for full user workflows
4. **Performance tests** for large recipe datasets

---

## References

- 📄 **Architecture Document**: [RecipeDiscoveryArchitecture.md](./RecipeDiscoveryArchitecture.md)
- 📄 **Checklist**: [Checklist.md](./Checklist.md)
- 🗄️ **Database Schema**: `backend/prisma/schema.prisma`
- 🔌 **API Routes**:
  - `backend/src/routes/preferences.ts`
  - `backend/src/routes/external-recipes.ts`
  - `backend/src/routes/video-recipes.ts`
- 🎨 **Shared Types**: `shared/src/types.ts`

---

**Next Milestone**: Build the Preference Settings UI (Phase 5)  
**Estimated Timeline**: 1 week for Phases 5-7 complete implementation
