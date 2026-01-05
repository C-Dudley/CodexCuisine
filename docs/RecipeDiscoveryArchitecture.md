# Recipe Discovery Architecture

## Web Scraping & Video Recipe Extraction

**Version**: 1.0  
**Date**: January 5, 2026  
**Status**: Design Phase → Implementation Ready

---

## Overview

CodexCuisine will expand beyond user-created recipes to include:

1. **Web Scraping** — Automatically extract recipes from popular cooking websites (AllRecipes, Food Network, etc.)
2. **Video Recipe Extraction** — Parse YouTube videos to extract recipe data from transcripts
3. **Dietary Filtering** — Filter all recipes (local + scraped) based on user allergies and dietary preferences
4. **Source Attribution** — Properly credit and link back to original recipe sources

This makes CodexCuisine a **unified discovery and meal-planning platform** similar to Yummly.

---

## System Architecture

### Data Flow Diagram

```
User Input
    ↓
[Web Scraper] ────→ Parse HTML → Extract Recipe Data → Store in DB
[YouTube API] ────→ Fetch Transcript → Parse Recipe → Store in DB
    ↓
[External Recipe Table] (AllRecipes, FoodNetwork, YouTube)
    ↓
[Dietary Filter Logic] ← User Preferences (Allergies, Dietary Type)
    ↓
[Filtered Results] ← Display in UI
    ↓
User can Save to Collection or Add to Meal Plan
```

---

## Database Schema

### New Tables

#### `DietaryPreference`

Tracks user dietary preferences (vegan, vegetarian, keto, paleo, gluten-free, etc.)

```sql
CREATE TABLE dietary_preferences (
  id UUID PRIMARY KEY,
  type STRING (e.g., "vegan", "vegetarian", "keto"),
  userId UUID FOREIGN KEY,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(userId, type)
);
```

#### `Allergy`

Tracks user allergies by ingredient name

```sql
CREATE TABLE allergies (
  id UUID PRIMARY KEY,
  ingredient STRING (e.g., "peanuts", "shellfish", "dairy"),
  userId UUID FOREIGN KEY,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(userId, ingredient)
);
```

#### `ExternalRecipe`

Stores recipes scraped from web sources and videos

```sql
CREATE TABLE external_recipes (
  id UUID PRIMARY KEY,
  title STRING,
  description STRING,
  instructions STRING (full recipe text),
  cookTime INT (minutes),
  servings INT,
  imageUrl STRING,
  sourceType STRING ("web" | "video"),
  sourceUrl STRING (original link),
  sourceSite STRING (AllRecipes, FoodNetwork, YouTube, etc.),
  fullText STRING (complete recipe text from source),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  INDEX (sourceSite, createdAt)
);
```

#### `ExternalIngredient`

Ingredients for external recipes (parsed from HTML or transcript)

```sql
CREATE TABLE external_ingredients (
  id UUID PRIMARY KEY,
  name STRING,
  quantity FLOAT,
  unit STRING (cups, tsp, oz, etc.),
  recipeId UUID FOREIGN KEY (external_recipes),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### `VideoRecipe`

Metadata for video recipes from YouTube, TikTok, Instagram

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
  INDEX (platform, videoId)
);
```

---

## Phase 5: User Preferences & Dietary Filters

### API Endpoints

#### **GET** `/api/preferences/:userId`

Fetch user's dietary preferences and allergies

**Response:**

```json
{
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

#### **POST** `/api/preferences/:userId`

Add a dietary preference

**Request:**

```json
{
  "type": "vegan"
}
```

#### **DELETE** `/api/preferences/:userId/:preferenceId`

Remove a dietary preference

#### **POST** `/api/allergies/:userId`

Add an allergy

**Request:**

```json
{
  "ingredient": "peanuts"
}
```

#### **DELETE** `/api/allergies/:userId/:allergyId`

Remove an allergy

---

## Phase 6: Web Scraping & Recipe Discovery

### Architecture

**Scraper Service** — Uses `cheerio` (lightweight HTML parser) to extract recipes

```typescript
// backend/src/services/recipeScraper.ts
export interface ScrapedRecipe {
  title: string;
  instructions: string;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
}

export async function scrapeAllRecipesRecipe(
  url: string
): Promise<ScrapedRecipe>;
export async function scrapeFoodNetworkRecipe(
  url: string
): Promise<ScrapedRecipe>;
```

### Supported Sites (Phase 6)

1. **AllRecipes** (`allrecipes.com`)

   - HTML Structure: `<script type="application/ld+json">` contains JSON-LD schema
   - Parser: Extract ingredients from JSON-LD, instructions from DOM

2. **Food Network** (`foodnetwork.com`)
   - HTML Structure: JSON-LD schema in `<script>` tags
   - Parser: Similar to AllRecipes; extract from structured data

### API Endpoints

#### **POST** `/api/external-recipes/scrape`

Manually trigger a scrape for a URL

**Request:**

```json
{
  "url": "https://www.allrecipes.com/recipe/12345/..."
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Spaghetti Carbonara",
  "instructions": "...",
  "cookTime": 20,
  "sourceUrl": "https://...",
  "sourceSite": "AllRecipes",
  "externalIngredients": [
    { "name": "pasta", "quantity": 1, "unit": "lb" },
    { "name": "eggs", "quantity": 4, "unit": "count" }
  ]
}
```

#### **GET** `/api/external-recipes?query=carbonara&limit=10&offset=0`

Search scraped recipes with pagination

**Response:**

```json
{
  "total": 42,
  "items": [
    {
      "id": "uuid",
      "title": "Spaghetti Carbonara",
      "cookTime": 20,
      "sourceUrl": "...",
      "sourceSite": "AllRecipes",
      "description": "..."
    }
  ]
}
```

#### **GET** `/api/external-recipes/:id`

Get full details of a scraped recipe

#### **POST** `/api/external-recipes/:id/save`

Save a scraped recipe to user's collection (creates a local `Recipe` entry with source attribution)

---

## Phase 7: Video Recipe Extraction

### YouTube Integration

**Setup:**

1. Create a YouTube Data API v3 project in Google Cloud
2. Generate API key with access to:
   - YouTube Data API v3
   - YouTube Transcript API (via Python service)

**Backend Service:**

```typescript
// backend/src/services/youtubeRecipeExtractor.ts
export async function extractRecipeFromYouTubeVideo(
  videoUrl: string
): Promise<VideoRecipe>;
export async function fetchVideoTranscript(videoId: string): Promise<string>;
export async function parseRecipeFromTranscript(
  transcript: string
): Promise<ScrapedRecipe>;
```

### Transcript Parsing Strategy

**Method 1: Keyword Extraction**

- Search for recipe keywords: "ingredients", "instructions", "recipe", "preparation"
- Extract text blocks between keywords

**Method 2: AI-Based Parsing (Future)**

- Use LLM (ChatGPT API) to identify and extract recipe structure from unstructured transcript

### API Endpoints

#### **POST** `/api/video-recipes/extract`

Submit a YouTube video URL for recipe extraction

**Request:**

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "platform": "YouTube"
}
```

**Response:**

```json
{
  "id": "uuid",
  "videoUrl": "...",
  "title": "How to Make Perfect Pasta Carbonara",
  "transcript": "...",
  "extractedRecipeId": "uuid" (if recipe successfully parsed),
  "platform": "YouTube",
  "videoId": "..."
}
```

#### **GET** `/api/video-recipes?platform=YouTube&limit=20`

Browse video recipes by platform

#### **GET** `/api/video-recipes/:id`

Get full video recipe details + extracted recipe data

---

## Filtering by User Preferences

### Filter Logic

When returning recipes (local, scraped, or video), apply this filter:

```typescript
// backend/src/services/recipeFilter.ts
export async function filterRecipesByUserPreferences(
  recipes: Recipe[],
  userId: string
): Promise<Recipe[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dietaryPreferences: true,
      allergies: true,
    },
  });

  return recipes.filter((recipe) => {
    // Check allergies
    const hasAllergen = recipe.ingredients.some((ing) =>
      user.allergies.some(
        (allergy) => allergy.ingredient.toLowerCase() === ing.name.toLowerCase()
      )
    );

    if (hasAllergen) return false;

    // TODO: Implement dietary preference filtering
    // (e.g., vegan recipe should have no meat/dairy)

    return true;
  });
}
```

### Dietary Preference Mapping

```typescript
const dietaryRules = {
  vegan: { excludeIngredients: ["meat", "dairy", "egg", "honey", "fish"] },
  vegetarian: { excludeIngredients: ["meat", "fish"] },
  keto: { excludeIngredients: ["grains", "sugar", "starch"] },
  paleo: { excludeIngredients: ["grains", "dairy", "legumes"] },
  glutenFree: { excludeIngredients: ["wheat", "barley", "rye"] },
};
```

---

## Web UI Components

### Phase 5: Preference Settings Page

**Route:** `/preferences` or `/settings`

**Features:**

- Toggle dietary preferences (checkboxes)
- Add/remove allergies (input + tag list)
- Save preferences button
- Clear all button

### Phase 6: External Recipe Search

**Route:** `/discover` or `/browse`

**Features:**

- Search bar (query recipes across all sources)
- Filter by:
  - Source (AllRecipes, FoodNetwork, YouTube)
  - Cook time
  - Dietary compatibility (auto-filters based on user prefs)
- Recipe cards showing:
  - Image, title, cook time, source site, source link
  - "Save to Collection" button
  - "Add to Meal Plan" button

### Phase 7: Video Recipe Browser

**Route:** `/videos` or `/video-recipes`

**Features:**

- Browse video recipes by platform
- Video preview/embed (iframe for YouTube)
- Show extracted recipe data (ingredients + instructions) if available
- "View on YouTube" link
- "Save Recipe" button (if recipe extracted successfully)

---

## Implementation Roadmap

### Week 1 (Phase 5)

- [ ] Create API endpoints for preferences/allergies
- [ ] Build preference settings frontend page
- [ ] Test filter logic with mock data

### Week 2 (Phase 6)

- [ ] Set up `cheerio` scraper service
- [ ] Implement AllRecipes parser
- [ ] Implement Food Network parser
- [ ] Build external recipe API routes
- [ ] Create recipe search/discovery frontend

### Week 3 (Phase 7)

- [ ] Set up YouTube API integration
- [ ] Build transcript parser
- [ ] Create video recipe extraction service
- [ ] Build video recipe browser UI

### Week 4 (Phase 8 - Auth)

- [ ] Implement JWT auth system
- [ ] Link user preferences to auth
- [ ] Ensure scraped recipes saved to user collection

---

## Security & Rate Limiting

### Web Scraping Safety

- **Rate Limiting**: Max 1 request per second per site (respectful)
- **User-Agent**: Set proper User-Agent header
- **Robots.txt**: Check before scraping
- **Terms of Service**: Ensure compliance with site ToS (most allow recipe scraping for personal use)

### YouTube API

- Use API key with IP whitelist
- Cache transcripts to avoid repeat API calls
- Handle 403 errors gracefully (private/deleted videos)

### Caching Strategy

```typescript
// Cache external recipes for 1 week
const CACHE_TTL = 7 * 24 * 60 * 60; // seconds

// Cache video transcripts indefinitely (they don't change)
const TRANSCRIPT_CACHE_TTL = null; // infinite
```

---

## Example Workflow

### User Flow: Find & Save a Web Recipe

1. User visits `/discover`
2. User searches for "carbonara"
3. Backend queries `external_recipes` table
4. Results filtered by user allergies + preferences
5. User sees 20 results from AllRecipes + FoodNetwork
6. User clicks "Save to Collection" on a recipe
7. System creates a new `Recipe` entry with source attribution
8. Recipe added to user's collection for meal planning

### User Flow: Extract from YouTube Video

1. User visits `/video-recipes`
2. User pastes YouTube link: `https://www.youtube.com/watch?v=...`
3. System fetches transcript from YouTube
4. System parses ingredients + instructions from transcript
5. System stores in `VideoRecipe` table with extracted recipe link
6. User sees extracted recipe data (ingredients + instructions)
7. User clicks "Add to Meal Plan"
8. Recipe available in meal planner (linked to video source)

---

## Future Enhancements

1. **AI-Powered Parsing** — Use LLM to improve video → recipe extraction accuracy
2. **TikTok/Instagram Support** — Parse recipe videos from social platforms
3. **Nutrition Tracking** — Add nutritional info for each recipe
4. **Smart Recommendations** — ML-based recipe recommendations based on user preferences
5. **Batch Scraping** — Background job to periodically scrape new recipes from popular sites
6. **Multi-Language Support** — Parse recipes in non-English sites
