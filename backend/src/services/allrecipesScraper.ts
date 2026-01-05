import {
  ScrapedRecipe,
  fetchUrl,
  parseJsonLd,
  extractIngredientsFromSchema,
  extractInstructionsFromSchema,
  parseDuration,
} from "./scraperUtils";

/**
 * Scrape a recipe from AllRecipes.com
 * Uses JSON-LD structured data
 */
export async function scrapeAllRecipesRecipe(
  url: string
): Promise<ScrapedRecipe> {
  const html = await fetchUrl(url);
  const schema = parseJsonLd(html);

  if (!schema) {
    throw new Error("Could not find recipe data in HTML (no JSON-LD schema)");
  }

  const cookTime = schema.cookTime ? parseDuration(schema.cookTime) : undefined;
  const ingredients = extractIngredientsFromSchema(schema);
  const instructions = extractInstructionsFromSchema(schema);

  return {
    title: schema.name || "Untitled Recipe",
    description: schema.description || "",
    instructions,
    cookTime,
    servings: schema.recipeYield ? parseInt(schema.recipeYield) : undefined,
    imageUrl: schema.image
      ? Array.isArray(schema.image)
        ? schema.image[0]
        : schema.image
      : undefined,
    ingredients,
  };
}

/**
 * Extract recipe ID from AllRecipes URL
 * Examples:
 * - https://www.allrecipes.com/recipe/12345/name/
 * - https://www.allrecipes.com/recipe/12345/
 */
export function getAllRecipesIdFromUrl(url: string): string | null {
  const match = url.match(/\/recipe\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Check if URL is from AllRecipes
 */
export function isAllRecipesUrl(url: string): boolean {
  return url.includes("allrecipes.com");
}
