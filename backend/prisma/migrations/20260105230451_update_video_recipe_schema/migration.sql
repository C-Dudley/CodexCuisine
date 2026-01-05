/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `video_recipes` table. All the data in the column will be lost.
  - Added the required column `authorName` to the `video_recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceType` to the `video_recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `video_recipes` table without a default value. This is not possible if the table is not empty.
  - Made the column `duration` on table `video_recipes` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_video_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "instructions" TEXT NOT NULL DEFAULT '[]',
    "cookTime" INTEGER,
    "servings" INTEGER,
    "sourceType" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "transcript" TEXT,
    "platform" TEXT NOT NULL,
    "extractedRecipeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_video_recipes" ("createdAt", "description", "duration", "extractedRecipeId", "id", "platform", "title", "transcript", "updatedAt", "videoId") SELECT "createdAt", "description", "duration", "extractedRecipeId", "id", "platform", "title", "transcript", "updatedAt", "videoId" FROM "video_recipes";
DROP TABLE "video_recipes";
ALTER TABLE "new_video_recipes" RENAME TO "video_recipes";
CREATE UNIQUE INDEX "video_recipes_sourceUrl_key" ON "video_recipes"("sourceUrl");
CREATE INDEX "video_recipes_platform_idx" ON "video_recipes"("platform");
CREATE INDEX "video_recipes_videoId_idx" ON "video_recipes"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
