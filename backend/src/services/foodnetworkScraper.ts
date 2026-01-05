import {
  ScrapedRecipe,
  fetchUrl,
  parseJsonLd,
  extractIngredientsFromSchema,
  extractInstructionsFromSchema,
  parseDuration,
} from "./scraperUtils";

/**
 * Scrape a recipe from FoodNetwork.com
 * Uses JSON-LD structured data (same as AllRecipes)
 */
export async function scrapeFoodNetworkRecipe(
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
 * Extract recipe ID or slug from FoodNetwork URL
 * Examples:
 * - https://www.foodnetwork.com/recipes/recipe-name-1234567/
 * - https://www.foodnetwork.com/recipes/name/
 */
export function getFoodNetworkIdFromUrl(url: string): string | null {
  const match = url.match(/\/recipes\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Check if URL is from Food Network
 */
export function isFoodNetworkUrl(url: string): boolean {
  return url.includes("foodnetwork.com");
}
