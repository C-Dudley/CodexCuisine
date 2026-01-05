-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meal_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT,
    "externalRecipeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meal_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_plans_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_plans_externalRecipeId_fkey" FOREIGN KEY ("externalRecipeId") REFERENCES "external_recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_meal_plans" ("createdAt", "date", "id", "mealType", "recipeId", "updatedAt", "userId") SELECT "createdAt", "date", "id", "mealType", "recipeId", "updatedAt", "userId" FROM "meal_plans";
DROP TABLE "meal_plans";
ALTER TABLE "new_meal_plans" RENAME TO "meal_plans";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
