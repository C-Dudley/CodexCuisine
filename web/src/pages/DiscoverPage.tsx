import React, { useState } from "react";
import axios from "axios";
import { Search, Filter, Plus, AlertCircle, Loader } from "lucide-react";

interface ExternalRecipe {
  id: string;
  title: string;
  description?: string;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  sourceSite: string;
  sourceUrl: string;
  externalIngredients?: Array<{
    id: string;
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  safeForUser?: boolean;
  allergenWarning?: string;
}

const DiscoverPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [recipes, setRecipes] = useState<ExternalRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingToMealPlan, setAddingToMealPlan] = useState<string | null>(null);
  const [mealPlanMessage, setMealPlanMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Mock user ID (in real app, get from auth context)
  const userId = "mock-user-id-123";
  const sources = ["AllRecipes", "Food Network"];

  const addToMealPlan = async (recipeId: string, recipeTitle: string) => {
    try {
      setAddingToMealPlan(recipeId);

      // Default to tomorrow's dinner (user can edit in meal plan page)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await axios.post("/api/meal-plan", {
        externalRecipeId: recipeId,
        date: tomorrow.toISOString().split("T")[0],
        mealType: "Dinner",
      });

      if (response.status === 201) {
        setMealPlanMessage({
          type: "success",
          text: `"${recipeTitle}" added to your meal plan for tomorrow!`,
        });
        setTimeout(() => setMealPlanMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Add to meal plan error:", err);
      setMealPlanMessage({
        type: "error",
        text: "Failed to add recipe to meal plan. Please try again.",
      });
      setTimeout(() => setMealPlanMessage(null), 3000);
    } finally {
      setAddingToMealPlan(null);
    }
  };

  const searchRecipes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const params = new URLSearchParams({
        query: searchQuery,
        ...(selectedSource && { sourceSite: selectedSource }),
        limit: "20",
        offset: "0",
        userId, // Include userId for filtering by preferences
      });

      const response = await axios.get(`/api/external-recipes?${params}`);
      setRecipes(response.data.items || []);

      if (response.data.items.length === 0) {
        setError("No recipes found. Try a different search term.");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Failed to search recipes. Please try again.");
      // Mock data fallback for demo
      setRecipes([
        {
          id: "1",
          title: "Classic Spaghetti Carbonara",
          description:
            "Traditional Italian pasta with eggs, cheese, and guanciale",
          cookTime: 20,
          servings: 4,
          imageUrl: "https://via.placeholder.com/300x200?text=Carbonara",
          sourceSite: "AllRecipes",
          sourceUrl: "https://www.allrecipes.com/recipe/carbonara/",
          externalIngredients: [
            { id: "1", name: "Spaghetti", quantity: 1, unit: "lb" },
            { id: "2", name: "Eggs", quantity: 4, unit: "count" },
            { id: "3", name: "Parmesan Cheese", quantity: 1, unit: "cup" },
            { id: "4", name: "Guanciale", quantity: 6, unit: "oz" },
          ],
          safeForUser: true,
        },
        {
          id: "2",
          title: "Grilled Salmon with Lemon",
          description: "Fresh Atlantic salmon grilled with herbs and lemon",
          cookTime: 15,
          servings: 2,
          imageUrl: "https://via.placeholder.com/300x200?text=Salmon",
          sourceSite: "Food Network",
          sourceUrl: "https://www.foodnetwork.com/recipes/salmon/",
          externalIngredients: [
            { id: "5", name: "Salmon Fillet", quantity: 2, unit: "lb" },
            { id: "6", name: "Lemon", quantity: 2, unit: "count" },
            { id: "7", name: "Olive Oil", quantity: 3, unit: "tbsp" },
          ],
          safeForUser: false,
          allergenWarning: "shellfish",
        },
        {
          id: "3",
          title: "Vegetable Stir Fry",
          description: "Colorful mix of fresh vegetables in a ginger-soy sauce",
          cookTime: 12,
          servings: 3,
          imageUrl: "https://via.placeholder.com/300x200?text=StirFry",
          sourceSite: "AllRecipes",
          sourceUrl: "https://www.allrecipes.com/recipe/stirfry/",
          externalIngredients: [
            { id: "8", name: "Bell Peppers", quantity: 2, unit: "count" },
            { id: "9", name: "Broccoli", quantity: 3, unit: "cups" },
            { id: "10", name: "Ginger", quantity: 1, unit: "tbsp" },
          ],
          safeForUser: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Recipes
          </h1>
          <p className="text-gray-600">
            Search thousands of recipes from AllRecipes, Food Network, and more
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={searchRecipes}>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes (e.g., carbonara, salmon, vegan pasta...)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              {/* Filter Dropdown */}
              <div>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Sources</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search
                </>
              )}
            </button>
          </form>

          {/* Info Text */}
          <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            💡 Results are automatically filtered to exclude recipes with your
            tracked allergens
          </p>
        </div>

        {/* Meal Plan Message */}
        {mealPlanMessage && (
          <div
            className={`mb-6 p-4 border rounded-lg flex gap-2 ${
              mealPlanMessage.type === "success"
                ? "bg-green-100 border-green-400 text-green-800"
                : "bg-red-100 border-red-400 text-red-800"
            }`}
          >
            {mealPlanMessage.type === "success" ? (
              <span className="text-lg">✓</span>
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{mealPlanMessage.text}</span>
          </div>
        )}

        {/* Error Message */}
        {error && hasSearched && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800 flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {loading
                ? "Searching..."
                : `Found ${recipes.length} recipe${
                    recipes.length !== 1 ? "s" : ""
                  }`}
            </h2>

            {recipes.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No recipes found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}

                      {/* Allergen Badge */}
                      {recipe.allergenWarning && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          ⚠️ {recipe.allergenWarning}
                        </div>
                      )}

                      {/* Safe Badge */}
                      {recipe.safeForUser && !recipe.allergenWarning && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          ✓ Safe for you
                        </div>
                      )}

                      {/* Source Badge */}
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                        {recipe.sourceSite}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>

                      {/* Description */}
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        {recipe.cookTime && (
                          <span>⏱️ {recipe.cookTime} min</span>
                        )}
                        {recipe.servings && (
                          <span>🍽️ {recipe.servings} servings</span>
                        )}
                      </div>

                      {/* Ingredients Preview */}
                      {recipe.externalIngredients &&
                        recipe.externalIngredients.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Ingredients ({recipe.externalIngredients.length})
                            </p>
                            <div className="space-y-1">
                              {recipe.externalIngredients
                                .slice(0, 3)
                                .map((ing) => (
                                  <p
                                    key={ing.id}
                                    className="text-xs text-gray-600"
                                  >
                                    • {ing.name}{" "}
                                    {ing.quantity &&
                                      `(${ing.quantity}${
                                        ing.unit ? " " + ing.unit : ""
                                      })`}
                                  </p>
                                ))}
                              {recipe.externalIngredients.length > 3 && (
                                <p className="text-xs text-gray-500 italic">
                                  +{recipe.externalIngredients.length - 3} more
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                        >
                          View Source
                        </a>
                        <button
                          onClick={() => addToMealPlan(recipe.id, recipe.title)}
                          disabled={addingToMealPlan === recipe.id}
                          className="flex-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          {addingToMealPlan === recipe.id ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add to Plan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">
              Start exploring recipes
            </p>
            <p className="text-gray-500">
              Search for your favorite dishes and discover new recipes from top
              cooking websites
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
