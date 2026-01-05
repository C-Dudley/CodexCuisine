import { ScrapedRecipe } from "./scraperUtils";
import { scrapeAllRecipesRecipe, isAllRecipesUrl } from "./allrecipesScraper";
import {
  scrapeFoodNetworkRecipe,
  isFoodNetworkUrl,
} from "./foodnetworkScraper";

export interface ScraperResult {
  recipe: ScrapedRecipe;
  sourceSite: string;
  sourceUrl: string;
}

/**
 * Main scraper orchestrator
 * Routes to the appropriate scraper based on URL
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScraperResult> {
  // Normalize URL
  url = url.trim();

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  let recipe: ScrapedRecipe;
  let sourceSite: string;

  if (isAllRecipesUrl(url)) {
    recipe = await scrapeAllRecipesRecipe(url);
    sourceSite = "AllRecipes";
  } else if (isFoodNetworkUrl(url)) {
    recipe = await scrapeFoodNetworkRecipe(url);
    sourceSite = "Food Network";
  } else {
    throw new Error(
      "Unsupported recipe source. Currently supported: AllRecipes.com, FoodNetwork.com"
    );
  }

  return {
    recipe,
    sourceSite,
    sourceUrl: url,
  };
}

/**
 * Get list of supported sites for documentation
 */
export function getSupportedSites(): string[] {
  return ["AllRecipes", "Food Network"];
}
