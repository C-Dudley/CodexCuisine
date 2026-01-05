import {
  extractYouTubeRecipe,
  isYouTubeUrl,
} from "./youtubeExtractor";
import {
  extractTikTokRecipe,
  isTikTokUrl,
} from "./tiktokExtractor";

export interface ScrapedVideoRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  sourceType: "YouTube" | "TikTok";
  videoId: string;
  sourceUrl: string;
  authorName: string;
  duration: number;
  thumbnailUrl?: string;
}

/**
 * Determine platform from URL
 */
const getPlatformFromUrl = (url: string): "youtube" | "tiktok" | null => {
  if (isYouTubeUrl(url)) return "youtube";
  if (isTikTokUrl(url)) return "tiktok";
  return null;
};

/**
 * Main scraper function - routes to appropriate extractor
 */
export const scrapeVideoRecipeFromUrl = async (
  url: string
): Promise<ScrapedVideoRecipe> => {
  const platform = getPlatformFromUrl(url);

  if (!platform) {
    throw new Error(
      "Unsupported video platform. Supported platforms: YouTube, TikTok"
    );
  }

  try {
    if (platform === "youtube") {
      const result = await extractYouTubeRecipe(url);

      if (!result) {
        throw new Error(
          "Could not extract recipe from this YouTube video. Make sure it contains recipe ingredients and instructions."
        );
      }

      return {
        title: result.title,
        description: result.description,
        ingredients: result.ingredients,
        instructions: result.instructions,
        cookTime: result.cookTime,
        servings: result.servings,
        sourceType: "YouTube",
        videoId: result.videoId,
        sourceUrl: url,
        authorName: result.channelTitle,
        duration: result.duration,
        thumbnailUrl: result.thumbnailUrl,
      };
    }

    if (platform === "tiktok") {
      const result = await extractTikTokRecipe(url);

      if (!result) {
        throw new Error(
          "Could not extract recipe from this TikTok video. Make sure it contains recipe ingredients and instructions."
        );
      }

      return {
        title: result.title,
        description: result.description,
        ingredients: result.ingredients,
        instructions: result.instructions,
        cookTime: result.cookTime,
        servings: result.servings,
        sourceType: "TikTok",
        videoId: result.videoId,
        sourceUrl: url,
        authorName: result.authorName,
        duration: result.duration,
        thumbnailUrl: result.coverUrl,
      };
    }

    throw new Error("Unknown platform");
  } catch (error) {
    throw error;
  }
};

/**
 * Get list of supported platforms
 */
export const getSupportedVideoPlatforms = (): string[] => {
  return ["YouTube", "YouTube Shorts", "TikTok"];
};
