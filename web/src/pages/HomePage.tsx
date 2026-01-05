import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, ChefHat, Star, Search, Plus } from "lucide-react";
import axios from "axios";

// API response types
interface Ingredient {
  id: string;
  name: string;
  unit: string | null;
  category: string | null;
}

interface IngredientList {
  id: string;
  quantity: number | null;
  ingredient: Ingredient;
}

interface Recipe {
  id: string;
  title: string;
  instructions: string;
  cookTime: number | null;
  createdAt: string;
  updatedAt: string;
  ingredientLists: IngredientList[];
}

interface RecipesResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const HomePage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRecipes();
  }, [currentPage, searchQuery]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", "12");

      const response = await axios.get<RecipesResponse>(
        `/api/recipes?${params}`
      );
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      // For development, show mock data if API fails
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecipes();
  };

  // Mock data for development when API is not available
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      title: "Classic Spaghetti Carbonara",
      instructions: "Cook pasta, mix eggs and cheese, combine with pancetta...",
      cookTime: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ingredientLists: [
        {
          id: "1",
          quantity: 200,
          ingredient: {
            id: "1",
            name: "Spaghetti",
            unit: "g",
            category: "Pantry",
          },
        },
        {
          id: "2",
          quantity: 100,
          ingredient: {
            id: "2",
            name: "Pancetta",
            unit: "g",
            category: "Meat",
          },
        },
      ],
    },
    {
      id: "2",
      title: "Homemade Margherita Pizza",
      instructions: "Make dough, add sauce and cheese, bake...",
      cookTime: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ingredientLists: [
        {
          id: "3",
          quantity: 250,
          ingredient: {
            id: "3",
            name: "Pizza Dough",
            unit: "g",
            category: "Pantry",
          },
        },
        {
          id: "4",
          quantity: 100,
          ingredient: {
            id: "4",
            name: "Mozzarella",
            unit: "g",
            category: "Dairy",
          },
        },
      ],
    },
  ];

  const displayRecipes = recipes.length > 0 ? recipes : mockRecipes;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              CodexCuisine — Discover Recipes
            </h1>
            <Link
              to="/meal-plan"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              My Meal Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search CodexCuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                    <ChefHat className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {recipe.cookTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.cookTime} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.ingredientLists.length} ingredients</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {recipe.instructions.substring(0, 100)}...
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More / Pagination */}
            {displayRecipes.length >= 12 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Load More Recipes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
