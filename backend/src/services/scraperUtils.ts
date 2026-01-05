import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedRecipe {
  title: string;
  description?: string;
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

/**
 * Parse JSON-LD structured data from HTML
 * Most modern recipe sites use JSON-LD for SEO/structured data
 */
export function parseJsonLd(html: string): any {
  const $ = cheerio.load(html);
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const jsonStr = $(jsonLdScripts[i]).html() || "";
      const json = JSON.parse(jsonStr);

      // Check if this is a Recipe schema
      if (
        json["@type"] === "Recipe" ||
        (Array.isArray(json) && json.some((j) => j["@type"] === "Recipe"))
      ) {
        // Handle array of schemas
        if (Array.isArray(json)) {
          const recipeSchema = json.find((j) => j["@type"] === "Recipe");
          if (recipeSchema) return recipeSchema;
        } else {
          return json;
        }
      }
    } catch (err) {
      // Continue to next script tag
      continue;
    }
  }

  return null;
}

/**
 * Extract ingredients from Recipe schema
 */
export function extractIngredientsFromSchema(
  schema: any
): ScrapedRecipe["ingredients"] {
  if (!schema.recipeIngredient) return [];

  return schema.recipeIngredient.map((ing: string) => {
    // Parse ingredient string like "2 cups flour"
    const match = ing.match(/^([\d\s\.\/]*)\s*(\w+)?\s*(.+)$/);

    if (match) {
      const quantityStr = match[1]?.trim();
      const unit = match[2]?.trim();
      const name = match[3]?.trim();

      let quantity: number | undefined;
      try {
        // Simple fraction support: "1/2" -> 0.5, "1 1/2" -> 1.5
        if (quantityStr) {
          if (quantityStr.includes("/")) {
            const parts = quantityStr.split("/");
            quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
          } else {
            quantity = parseFloat(quantityStr);
          }
        }
      } catch {
        quantity = undefined;
      }

      return {
        name: name || ing,
        quantity,
        unit,
      };
    }

    return { name: ing };
  });
}

/**
 * Extract cooking instructions from Recipe schema
 */
export function extractInstructionsFromSchema(schema: any): string {
  if (!schema.recipeInstructions) return "";

  // recipeInstructions can be a string or an array of objects
  if (typeof schema.recipeInstructions === "string") {
    return schema.recipeInstructions;
  }

  if (Array.isArray(schema.recipeInstructions)) {
    return schema.recipeInstructions
      .map((step: any) => {
        if (typeof step === "string") return step;
        if (typeof step === "object" && step.text) return step.text;
        return "";
      })
      .filter((s: string) => s.length > 0)
      .join("\n");
  }

  return "";
}

/**
 * Parse ISO 8601 duration to minutes
 * Example: "PT30M" -> 30, "PT1H30M" -> 90
 */
export function parseDuration(duration: string): number | undefined {
  if (!duration) return undefined;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;

  return hours * 60 + minutes;
}

/**
 * Fetch a URL with proper headers
 */
export async function fetchUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error}`);
  }
}
