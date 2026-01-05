🏗️ Phase 1: The Foundation (Infrastructure)
[x] Initialize Monorepo: Set up the folder structure (backend, web, shared) and install dependencies.

[x] Prisma Setup: Schema created, client generated, SQLite database migrated and seeded with ingredients.

[x] Shared Types: Move your TypeScript interfaces (Recipe, User, MealPlan) into the shared/ folder so both the frontend and backend can use them.

[-] Dockerize: Using SQLite for development instead of Docker - database setup complete.

🍱 Phase 2: Core Recipe Engine
[x] Seeding: Seed script created and ingredients populated - need to add at least 10 recipes.

[x] API - Recipe Routes: Routes updated to work with simplified schema and now compile successfully.

[x] Web - Discovery Page: HomePage.tsx fully implemented with recipe grid, search, and pagination.

[x] Web - Recipe Detail: RecipePage.tsx fully implemented with instructions, ingredients, and add-to-meal-plan buttons.

📅 Phase 3: The "Planner" (Your Main Feature)
[x] API - Meal Plan Routes: Implement the POST and GET routes for the meal plan table.

[x] Web - The Grid: Use the Copilot prompt to build the 7-day Meal Plan Chart with Drag & Drop.

[-] Web - Action Logic: Drag-and-drop integration with backend routes ready. (Implemented and ready for end-to-end testing)

🛒 Phase 4: The Smart Shopping List
[x] Service Logic: Use the "Aggregation" prompt to create the backend function that sums up ingredients.

[x] Web - Shopping View: Build a simple checklist page grouped by category (Produce, Meat, etc.). (✅ COMPLETE: ShoppingListPage.tsx with toggle, delete, and category grouping)

[x] State Management: Toggle feature for checking items off as they shop. (✅ COMPLETE: Fully implemented in ShoppingListPage)

🚀 Phase 5: User Preferences & Dietary Filters
[x] Database Models: Add DietaryPreference and Allergy tables to track user preferences. (✅ COMPLETE: Migration applied)

[x] API - Preference Routes: GET/POST/DELETE endpoints for managing user dietary preferences and allergies. (✅ COMPLETE: preferences.ts route created)

[x] Web - Preference Settings: Create a settings page where users can toggle dietary preferences (vegan, vegetarian, keto, etc.) and add allergies. (✅ COMPLETE: PreferencesPage.tsx with quick toggles and custom inputs)

[x] Search Filter Logic: Implement backend logic to filter recipes based on user preferences and allergies across all sources. (✅ COMPLETE: recipeFilter.ts service + integrated into recipes and external-recipes routes)

🌐 Phase 6: Web Scraping & Recipe Discovery
[x] Scraper Service Setup: Create backend service using `cheerio` for parsing HTML from recipe websites. (✅ COMPLETE: scraperUtils.ts with JSON-LD parsing)

[x] AllRecipes Scraper: Build scraper targeting AllRecipes.com recipe pages. (✅ COMPLETE: allrecipesScraper.ts)

[x] Food Network Scraper: Build scraper targeting FoodNetwork.com recipe pages. (✅ COMPLETE: foodnetworkScraper.ts)

[x] External Recipe API Routes: Create routes to store and retrieve scraped recipes from ExternalRecipe table. (✅ COMPLETE: external-recipes.ts route created)

[ ] Web - Recipe Search & Import: Frontend page to search external recipes and save them to user collection.

[ ] Filter by Preferences: Integrate dietary filter logic into external recipe search results.

📹 Phase 7: Video Recipe Extraction
[ ] YouTube Integration: Set up YouTube API integration to fetch video metadata and transcripts.

[ ] Transcript Parser: Create service to extract recipe details from video transcripts.

[x] Video Recipe Routes: API endpoints to store and retrieve video recipes from VideoRecipe table. (✅ COMPLETE: video-recipes.ts route created)

[ ] TikTok/Instagram Support: Add support for parsing TikTok and Instagram recipe videos (using transcript or description parsing).

[ ] Web - Video Recipe Browser: Frontend interface to browse and import video recipes with extracted ingredients.

🔐 Phase 8: Authentication & Authorization
[ ] Auth System: Implement JWT login/register so users can save their specific plans and preferences.

[ ] User Profiles: Create user profile pages with saved recipes, preferences, and meal plans.

[ ] Recipe Attribution: Ensure scraped recipes are properly attributed to original sources.

📱 Phase 9: Polishing & Deployment
[ ] Responsiveness: Make sure the app looks good on mobile browsers (meal plan grid, shopping list, scraper UI).

[ ] Performance: Optimize database queries, add caching for external recipes.

[ ] Error Handling: Improve error messages for scraping failures, missing data.

[ ] Final README Update: Update documentation with screenshots and usage examples.
