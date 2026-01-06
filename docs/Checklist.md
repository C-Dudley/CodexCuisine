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

[x] Web - Recipe Search & Import: Frontend page to search external recipes and save them to user collection. (✅ COMPLETE: DiscoverPage.tsx with search, filters, and recipe cards)

[x] Filter by Preferences: Integrate dietary filter logic into external recipe search results. (✅ COMPLETE: Integrated into external-recipes.ts and DiscoverPage displays safety status)

[x] Add External Recipes to Meal Plan: Enable "Add to Plan" button to save external recipes to user's meal plan. (✅ COMPLETE: Updated MealPlan schema with optional externalRecipeId, implemented addToMealPlan() function with default tomorrow date)

📹 Phase 7: Video Recipe Extraction
[x] YouTube Integration: Set up YouTube transcript extraction and recipe parsing. (✅ COMPLETE: youtubeExtractor.ts with ytdl-core and transcript extraction)

[x] TikTok Integration: Extract recipe data from TikTok video metadata and descriptions. (✅ COMPLETE: tiktokExtractor.ts with metadata parsing)

[x] Transcript Parser: Create service to extract recipe details from video content. (✅ COMPLETE: videoRecipeScraper.ts orchestrator with ingredient/instruction parsing)

[x] Video Recipe Routes: API endpoints to store and retrieve video recipes from VideoRecipe table. (✅ COMPLETE: video-recipes.ts POST /scrape endpoint with full implementation)

[x] Web - Video Recipe Browser: Frontend interface to browse and import video recipes with extracted ingredients. (✅ COMPLETE: VideoDiscoveryPage.tsx with search, extraction form, and recipe cards)

🔐 Phase 8: Authentication & Authorization
[x] Backend JWT Middleware: Express middleware with token validation, user extraction from cookies. (✅ COMPLETE: auth.ts middleware with getUserFromRequest, requireAuth guards)

[x] JWT Utilities Service: Token generation, verification, cookie management, token rotation. (✅ COMPLETE: jwt-utils.ts service with full CodexClarity-compatible implementation)

[x] Backend Route Integration: Updated meal-plan.ts and other protected routes to use auth context. (✅ COMPLETE: All routes updated to use req.user.userId)

[x] Frontend AuthContext: React context with login/logout/auto-refresh, manages user state. (✅ COMPLETE: AuthContext.tsx with 10-min auto-refresh and error handling)

[x] LoginPage Component: Email/password form with validation, error display, loading states. (✅ COMPLETE: LoginPage.tsx with strength indicator and real-time validation)

[x] SignupPage Component: Registration form with password validation, strength meter, confirmation matching. (✅ COMPLETE: SignupPage.tsx with 8+ char, uppercase, number requirements)

[x] ProtectedRoute Guards: Route wrapper checking authentication status. (✅ COMPLETE: ProtectedRoute.tsx with redirect to /login for unauthenticated users)

[x] App Integration: AuthProvider wrapper, protected route configuration, updated navigation. (✅ COMPLETE: App.tsx refactored with BrowserRouter, AuthProvider, protected routes)

[x] Header Update: Logout button in user menu, conditional navigation based on auth status. (✅ COMPLETE: Header.tsx with user dropdown menu, logout, role display)

[x] Environment Setup: SESSION_SECRET added to .env and .env.example. (✅ COMPLETE: Added with documentation about CodexClarity integration)

📱 Phase 9: Polishing & Deployment
[ ] Responsiveness: Make sure the app looks good on mobile browsers (meal plan grid, shopping list, scraper UI).

[ ] Performance: Optimize database queries, add caching for external recipes.

[ ] Error Handling: Improve error messages for scraping failures, missing data.

[ ] Final README Update: Update documentation with screenshots and usage examples.
