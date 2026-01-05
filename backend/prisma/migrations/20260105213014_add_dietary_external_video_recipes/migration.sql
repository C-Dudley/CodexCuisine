-- CreateTable
CREATE TABLE "dietary_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dietary_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingredient" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "allergies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "external_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "cookTime" INTEGER,
    "servings" INTEGER,
    "imageUrl" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceSite" TEXT NOT NULL,
    "fullText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "external_ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" REAL,
    "unit" TEXT,
    "recipeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "external_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "external_recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "video_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "transcript" TEXT,
    "duration" INTEGER,
    "platform" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "extractedRecipeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "dietary_preferences_userId_type_key" ON "dietary_preferences"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_userId_ingredient_key" ON "allergies"("userId", "ingredient");

-- CreateIndex
CREATE INDEX "external_recipes_sourceSite_idx" ON "external_recipes"("sourceSite");

-- CreateIndex
CREATE INDEX "external_recipes_createdAt_idx" ON "external_recipes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "video_recipes_videoUrl_key" ON "video_recipes"("videoUrl");

-- CreateIndex
CREATE INDEX "video_recipes_platform_idx" ON "video_recipes"("platform");

-- CreateIndex
CREATE INDEX "video_recipes_videoId_idx" ON "video_recipes"("videoId");
