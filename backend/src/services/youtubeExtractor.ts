import axios from "axios";
import * as ytdl from "ytdl-core";

interface YouTubeInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnails: Array<{ url: string; width: number; height: number }>;
  duration: number;
  channelTitle: string;
}

interface RecipeFromTranscript {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  summary: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export const getYouTubeIdFromUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Validate if URL is a YouTube URL
 */
export const isYouTubeUrl = (url: string): boolean => {
  return (
    /youtube\.com|youtu\.be/.test(url) && getYouTubeIdFromUrl(url) !== null
  );
};

/**
 * Fetch YouTube video metadata (title, description, duration, etc.)
 */
export const fetchYouTubeVideoInfo = async (
  videoId: string
): Promise<YouTubeInfo> => {
  try {
    const info = await ytdl.getInfo(videoId);
    const details = info.videoDetails;

    return {
      videoId: details.videoId,
      title: details.title,
      description: details.description || "",
      thumbnails: details.thumbnails,
      duration: parseInt(details.lengthSeconds, 10),
      channelTitle: details.author.name,
    };
  } catch (error) {
    throw new Error(`Failed to fetch YouTube video info: ${error}`);
  }
};

/**
 * Fetch transcript from YouTube video
 * Returns transcript text or falls back to description
 */
export const fetchYouTubeTranscript = async (
  videoId: string
): Promise<string> => {
  try {
    // Try to get transcript using youtube-transcript-api
    const response = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`
    );
    const html = response.data;

    // Look for captions in initial data
    const captionTracksMatch = html.match(/"captionTracks":\[(.*?)\]/);
    if (captionTracksMatch) {
      // Parse and fetch captions
      try {
        const captionTracks = JSON.parse("[" + captionTracksMatch[1] + "]");
        if (captionTracks.length > 0) {
          const captionUrl = captionTracks[0].baseUrl;
          const captionResponse = await axios.get(captionUrl);
          const captions = captionResponse.data;

          // Extract text from XML-like caption format
          const textMatches =
            captions.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
          const transcript = textMatches
            .map((match: string) =>
              match
                .replace(/<[^>]*>/g, "")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, "&")
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
            )
            .join(" ");

          return transcript;
        }
      } catch (err) {
        console.warn("Failed to extract captions from transcript", err);
      }
    }

    throw new Error("No transcript available");
  } catch (error) {
    console.warn(`Transcript fetch failed: ${error}`);
    return ""; // Empty transcript - will use description fallback
  }
};

/**
 * Parse recipe from YouTube transcript or description
 * Uses regex patterns to extract ingredients and instructions
 */
export const parseRecipeFromTranscript = (
  transcript: string,
  videoDescription: string
): RecipeFromTranscript | null => {
  const fullText = transcript || videoDescription || "";

  if (!fullText) {
    return null;
  }

  // Look for common recipe structure markers
  const hasIngredients =
    /ingredient|ingredient list|what you need|you will need|equipment/i.test(
      fullText
    );
  const hasInstructions =
    /instruction|step|direction|how to|preparation|cook|bake|mix/i.test(
      fullText
    );

  if (!hasIngredients && !hasInstructions) {
    return null;
  }

  // Extract ingredients (lines with quantities or common food words)
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /(\d+\s*(?:cup|tbsp|tsp|oz|g|ml|lb|kg|pinch|handful|can|bottle|package|tablespoon|teaspoon|gram|kilogram|pound|ounce)[s]?\s+[^,\n.]+)/gi,
    /(\d+\s*(?:whole|half|quarter)[s]?\s+[^,\n.]+)/gi,
  ];

  for (const pattern of ingredientPatterns) {
    const matches = fullText.match(pattern);
    if (matches) {
      ingredients.push(
        ...matches.slice(0, 15).filter((ing) => !ingredients.includes(ing))
      );
    }
  }

  // If no ingredients found with regex, try splitting by common markers
  if (ingredients.length === 0) {
    const ingredientSection = fullText.match(
      /(?:ingredient|ingredient list|you will need|what you need)([\s\S]*?)(?:instruction|step|preparation|cook|direction|how to)/i
    );
    if (ingredientSection) {
      const items = ingredientSection[1]
        .split(/[\n•-]/g)
        .map((item) => item.trim())
        .filter(
          (item) => item.length > 3 && !item.match(/^\d+$/) && item.length < 100
        );
      ingredients.push(...items.slice(0, 15));
    }
  }

  // Extract instructions (numbered steps or bullet points)
  const instructions: string[] = [];
  const stepPatterns = [
    /\b(?:step|step \d+)[\s:]+([^.!?]+[.!?])/gi,
    /^\s*\d+[\s.)\-:]+([^.!?]+[.!?])/gim,
  ];

  for (const pattern of stepPatterns) {
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      const step = match[1].trim();
      if (step.length > 10 && step.length < 200) {
        instructions.push(step);
      }
    }
  }

  // If no instructions found with regex, split by common markers
  if (instructions.length === 0) {
    const instructionSection = fullText.match(
      /(?:instruction|step|preparation|cook|direction|how to)([\s\S]*?)(?:tip|note|serve|storage|cook time|prep time|yield|ingredient|$)/i
    );
    if (instructionSection) {
      const steps = instructionSection[1]
        .split(/[\n•-]/g)
        .map((item) => item.trim())
        .filter((item) => item.length > 10 && item.length < 200);
      instructions.push(...steps.slice(0, 15));
    }
  }

  // Extract cook time (e.g., "15 minutes", "1 hour 30 mins")
  let cookTime: number | undefined;
  const timeMatch = fullText.match(
    /(?:cook|bake|prep|total)\s*time[:\s]+(\d+)\s*(?:hour|hr|h)?[\s-]*(\d+)?\s*(?:minute|min|m)?/i
  );
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10) || 0;
    const minutes = parseInt(timeMatch[2], 10) || 0;
    cookTime = hours * 60 + minutes;
  }

  // Extract servings
  let servings: number | undefined;
  const servingsMatch = fullText.match(
    /(?:serves|yield|make|servings?)[\s:]+(\d+)/i
  );
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1], 10);
  }

  // Build description from first 200 chars of transcript
  const summary = fullText.substring(0, 200).replace(/\s+/g, " ");

  if (ingredients.length === 0 && instructions.length === 0) {
    return null;
  }

  return {
    title: "", // Will be set from video title
    ingredients: Array.from(new Set(ingredients)), // Remove duplicates
    instructions: Array.from(new Set(instructions)),
    cookTime,
    servings,
    summary,
  };
};

/**
 * Main function: Extract recipe from YouTube video
 */
export const extractYouTubeRecipe = async (
  url: string
): Promise<{
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  videoId: string;
  channelTitle: string;
  duration: number;
  thumbnailUrl?: string;
} | null> => {
  const videoId = getYouTubeIdFromUrl(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  try {
    // Fetch video metadata
    const videoInfo = await fetchYouTubeVideoInfo(videoId);

    // Try to fetch transcript, fallback to description
    const transcript = await fetchYouTubeTranscript(videoId);
    const recipe = parseRecipeFromTranscript(transcript, videoInfo.description);

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
      channelTitle: videoInfo.channelTitle,
      duration: videoInfo.duration,
      thumbnailUrl: videoInfo.thumbnails[0]?.url,
    };
  } catch (error) {
    console.error(`YouTube extraction error: ${error}`);
    throw error;
  }
};
