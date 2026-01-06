import React, { useState } from "react";
import axios from "axios";
import { Search, Plus, AlertCircle, Loader, Play } from "lucide-react";

interface VideoRecipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string;
  instructions: string;
  cookTime?: number;
  servings?: number;
  sourceType: string;
  videoId: string;
  sourceUrl: string;
  authorName: string;
  duration: number;
  thumbnailUrl?: string;
}

const VideoDiscoveryPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [recipes, setRecipes] = useState<VideoRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const sources = ["YouTube", "TikTok"];

  const searchRecipes = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const params = new URLSearchParams({
        limit: "20",
        offset: "0",
        ...(sourceFilter && { sourceType: sourceFilter }),
      });

      const response = await axios.get(`/api/video-recipes?${params}`);
      setRecipes(response.data.items || []);

      if (response.data.items.length === 0) {
        setError("No video recipes found. Try scraping one first!");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Failed to load video recipes.");
    } finally {
      setLoading(false);
    }
  };

  const scrapeVideoRecipe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    try {
      setScraping(true);
      setError(null);

      const response = await axios.post("/api/video-recipes/scrape", {
        url: videoUrl.trim(),
      });

      if (response.status === 201) {
        setMessage({
          type: "success",
          text: `"${response.data.title}" extracted successfully!`,
        });
        setVideoUrl("");
        // Refresh list
        setTimeout(() => searchRecipes(new Event("submit") as any), 1500);
      }
    } catch (err: any) {
      console.error("Scrape error:", err);
      const errorMsg =
        err.response?.data?.error || "Failed to extract recipe from video";
      setError(errorMsg);
    } finally {
      setScraping(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const parseJson = (jsonString: string, defaultVal: any[] = []) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultVal;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Video Recipes
          </h1>
          <p className="text-gray-600">
            Extract recipes from YouTube and TikTok videos
          </p>
        </div>

        {/* Scraper Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Extract Recipe from Video
          </h2>
          <form onSubmit={scrapeVideoRecipe}>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube or TikTok video URL..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <button
                type="submit"
                disabled={scraping}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {scraping ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Extract
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              💡 Supported: YouTube (videos & shorts), TikTok videos
            </p>
          </form>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 border rounded-lg flex gap-2 ${
              message.type === "success"
                ? "bg-green-100 border-green-400 text-green-800"
                : "bg-red-100 border-red-400 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <span className="text-lg">✓</span>
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Error Message */}
        {error && hasSearched && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800 flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Search/Browse Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browse Extracted Recipes
          </h2>
          <form onSubmit={searchRecipes}>
            <div className="flex gap-3">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Browse
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Found {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
            </h2>

            {recipes.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No video recipes found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => {
                  const ingredients = parseJson(recipe.ingredients, []);
                  const instructions = parseJson(recipe.instructions, []);

                  return (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        {recipe.thumbnailUrl ? (
                          <img
                            src={recipe.thumbnailUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                            <Play className="h-12 w-12 text-purple-600 opacity-50" />
                          </div>
                        )}

                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                          {formatDuration(recipe.duration)}
                        </div>

                        {/* Source Badge */}
                        <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                          {recipe.sourceType}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {recipe.title}
                        </h3>

                        {/* Author */}
                        <p className="text-sm text-gray-600 mb-3">
                          By {recipe.authorName}
                        </p>

                        {/* Ingredients Count */}
                        <div className="mb-3 text-sm text-gray-700">
                          <span className="font-semibold">
                            📋 {ingredients.length}
                          </span>{" "}
                          ingredients
                        </div>

                        {/* Ingredients Preview */}
                        {ingredients.length > 0 && (
                          <div className="mb-4 text-xs text-gray-600 space-y-1">
                            {ingredients
                              .slice(0, 2)
                              .map((ing: string, idx: number) => (
                                <p key={idx}>• {ing.substring(0, 50)}</p>
                              ))}
                            {ingredients.length > 2 && (
                              <p className="text-gray-500 italic">
                                +{ingredients.length - 2} more
                              </p>
                            )}
                          </div>
                        )}

                        {/* Recipe Meta */}
                        <div className="flex gap-3 text-sm text-gray-600 mb-4">
                          {recipe.cookTime && (
                            <span>⏱️ {recipe.cookTime} min</span>
                          )}
                          {recipe.servings && (
                            <span>🍽️ {recipe.servings} servings</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <a
                            href={recipe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                          >
                            Watch
                          </a>
                          <button className="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center justify-center gap-1 text-sm font-medium">
                            <Plus className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">
              Discover recipes from videos
            </p>
            <p className="text-gray-500">
              Paste a YouTube or TikTok video URL above to extract the recipe
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDiscoveryPage;
