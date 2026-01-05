import axios from "axios";

interface TikTokVideoInfo {
  videoId: string;
  title: string;
  description: string;
  authorName: string;
  duration: number;
  coverUrl?: string;
}

interface RecipeFromText {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  summary: string;
}

/**
 * Extract TikTok video ID from URL
 */
export const getTikTokIdFromUrl = (url: string): string | null => {
  const patterns = [/\/video\/(\d+)/, /^(\d+)$/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Validate if URL is a TikTok URL
 */
export const isTikTokUrl = (url: string): boolean => {
  return /tiktok\.com|vm\.tiktok|vt\.tiktok/.test(url);
};

/**
 * Fetch TikTok video metadata using public API endpoint
 * Note: TikTok API is restricted; this uses a workaround with metadata from HTML
 */
export const fetchTikTokVideoInfo = async (
  url: string
): Promise<TikTokVideoInfo> => {
  try {
    // TikTok metadata can be extracted from HTML og tags
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    // Extract metadata from og tags
    const titleMatch = html.match(
      /<meta property="og:title" content="([^"]+)"/
    );
    const descriptionMatch = html.match(
      /<meta property="og:description" content="([^"]+)"/
    );
    const imageMatch = html.match(
      /<meta property="og:image" content="([^"]+)"/
    );

    const title = titleMatch
      ? titleMatch[1].replace(/&quot;/g, '"')
      : "TikTok Recipe";
    const description = descriptionMatch
      ? descriptionMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")
      : "";
    const coverUrl = imageMatch ? imageMatch[1] : undefined;

    // Extract video ID from URL
    const videoId = getTikTokIdFromUrl(url) || "unknown";

    // Try to extract author name from URL or HTML
    const authorMatch = url.match(/@([a-zA-Z0-9._-]+)/);
    const authorName = authorMatch ? authorMatch[1] : "TikTok Creator";

    // Estimate duration from description if available
    // TikTok videos are typically 15-60 seconds
    const duration = 30; // Default estimate

    return {
      videoId,
      title,
      description,
      authorName,
      duration,
      coverUrl,
    };
  } catch (error) {
    throw new Error(`Failed to fetch TikTok video info: ${error}`);
  }
};

/**
 * Parse recipe from TikTok description/caption
 * TikTok captions are usually in the description
 */
export const parseRecipeFromTikTokText = (
  description: string
): RecipeFromText | null => {
  if (!description) {
    return null;
  }

  const fullText = description;

  // Check if this looks like a recipe video
  const hasIngredients =
    /ingredient|ingredient list|you need|supplies|what you need/i.test(
      fullText
    );
  const hasInstructions =
    /instruction|step|direction|how to|mix|add|combine|cook|bake/i.test(
      fullText
    );

  if (!hasIngredients && !hasInstructions) {
    return null;
  }

  // Extract ingredients - look for quantities with common units
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /(\d+\s*(?:cup|tbsp|tsp|oz|g|ml|lb|kg|pinch|handful|can)[s]?\s+[^,\n.]+)/gi,
    /(\d+\s*(?:whole|half|quarter)[s]?\s+[^,\n.]+)/gi,
  ];

  for (const pattern of ingredientPatterns) {
    const matches = fullText.match(pattern);
    if (matches) {
      ingredients.push(
        ...matches
          .slice(0, 15)
          .filter((ing) => !ingredients.includes(ing) && ing.length < 100)
      );
    }
  }

  // Fallback: split by hashtags or line breaks
  if (ingredients.length === 0) {
    const lines = fullText.split(/[#\n]/g);
    lines.forEach((line) => {
      const cleaned = line.trim();
      if (
        cleaned.length > 3 &&
        cleaned.length < 100 &&
        !cleaned.match(/^@/) &&
        !cleaned.match(/^http/)
      ) {
        ingredients.push(cleaned);
      }
    });
    ingredients.splice(15); // Limit to 15
  }

  // Extract instructions - look for numbered steps or action words
  const instructions: string[] = [];
  const actionWords = [
    "add",
    "mix",
    "combine",
    "stir",
    "fold",
    "pour",
    "place",
    "bake",
    "cook",
    "heat",
    "cut",
    "chop",
    "blend",
    "whisk",
  ];
  const actionRegex = new RegExp(
    `\\b(${actionWords.join("|")})\\s+[^.!?]+[.!?]`,
    "gi"
  );

  let match;
  while ((match = actionRegex.exec(fullText)) !== null) {
    const instruction = match[0].trim();
    if (instruction.length > 10 && instruction.length < 200) {
      instructions.push(instruction);
    }
  }

  // If few instructions found, split by periods/exclamation marks
  if (instructions.length < 2) {
    const sentences = fullText.split(/[.!?]/g);
    sentences.forEach((sentence) => {
      const cleaned = sentence.trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        instructions.push(cleaned);
      }
    });
    instructions.splice(10); // Limit to 10
  }

  // Extract cook time if mentioned
  let cookTime: number | undefined;
  const timeMatch = fullText.match(
    /(?:cook|bake|mix|prep|total)\s*(?:time)?[\s:]*(\d+)\s*(?:min|minute|sec|second)/i
  );
  if (timeMatch) {
    const time = parseInt(timeMatch[1], 10);
    // For TikTok, assume in seconds if under 100, otherwise minutes
    cookTime = time < 100 ? Math.ceil(time / 60) : time;
  }

  // Extract servings
  let servings: number | undefined;
  const servingsMatch = fullText.match(
    /(?:serves|yield|make|servings?)[\s:]*(\d+)/i
  );
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1], 10);
  }

  // Build description from first 200 chars
  const summary = fullText.substring(0, 200).replace(/\s+/g, " ");

  if (ingredients.length === 0 && instructions.length === 0) {
    return null;
  }

  return {
    title: "", // Will be set from video title
    ingredients: Array.from(new Set(ingredients)),
    instructions: Array.from(new Set(instructions)),
    cookTime,
    servings,
    summary,
  };
};

/**
 * Main function: Extract recipe from TikTok video
 */
export const extractTikTokRecipe = async (
  url: string
): Promise<{
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  videoId: string;
  authorName: string;
  duration: number;
  coverUrl?: string;
} | null> => {
  if (!isTikTokUrl(url)) {
    throw new Error("Invalid TikTok URL");
  }

  try {
    // Fetch video metadata
    const videoInfo = await fetchTikTokVideoInfo(url);

    // Parse recipe from description
    const recipe = parseRecipeFromTikTokText(videoInfo.description);

    if (!recipe) {
      return null; // Not a recipe video
    }

    return {
      title: videoInfo.title,
      description: recipe.summary,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      videoId: videoInfo.videoId,
      authorName: videoInfo.authorName,
      duration: videoInfo.duration,
      coverUrl: videoInfo.coverUrl,
    };
  } catch (error) {
    console.error(`TikTok extraction error: ${error}`);
    throw error;
  }
};
