import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, Users, ChefHat, ArrowLeft, Plus } from "lucide-react";
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

const RecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const response = await axios.get<Recipe>(`/api/recipes/${recipeId}`);
      setRecipe(response.data);
    } catch (error) {
      console.error("Failed to fetch recipe:", error);
      setError("Failed to load recipe");
      // Mock data for development
      setRecipe({
        id: recipeId,
        title: "Classic Spaghetti Carbonara",
        instructions: `1. Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.

2. While pasta cooks, cut pancetta into small cubes. Cook in a large skillet over medium heat until crispy, about 5-7 minutes. Remove from heat.

3. In a bowl, whisk together eggs, grated Parmesan, and plenty of black pepper.

4. When pasta is done, reserve 1 cup of pasta water, then drain pasta.

5. Working quickly, add hot pasta to the skillet with pancetta. Toss to combine.

6. Remove from heat and immediately pour in the egg mixture, tossing vigorously to create a creamy sauce. Add pasta water a little at a time if needed to loosen the sauce.

7. Serve immediately with extra Parmesan and black pepper.`,
        cookTime: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredientLists: [
          {
            id: "1",
            quantity: 400,
            ingredient: {
              id: "1",
              name: "Spaghetti",
              unit: "g",
              category: "Pantry",
            },
          },
          {
            id: "2",
            quantity: 150,
            ingredient: {
              id: "2",
              name: "Pancetta",
              unit: "g",
              category: "Meat",
            },
          },
          {
            id: "3",
            quantity: 3,
            ingredient: {
              id: "3",
              name: "Large eggs",
              unit: "pieces",
              category: "Dairy",
            },
          },
          {
            id: "4",
            quantity: 100,
            ingredient: {
              id: "4",
              name: "Parmesan cheese",
              unit: "g",
              category: "Dairy",
            },
          },
          {
            id: "5",
            quantity: null,
            ingredient: {
              id: "5",
              name: "Black pepper",
              unit: "to taste",
              category: "Pantry",
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const addToMealPlan = async (mealType: string) => {
    if (!recipe) return;

    try {
      // For now, just show an alert. In a real app, this would open a date picker
      alert(`Added ${recipe.title} to ${mealType} meal plan!`);
      // TODO: Implement meal plan addition with date selection
    } catch (error) {
      console.error("Failed to add to meal plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Recipe Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error || "The recipe you're looking for doesn't exist."}</p>
          <Link
            to="/"
            className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Header */}
          <div className="relative">
            <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <ChefHat className="h-20 w-20 sm:h-24 sm:w-24 text-purple-300" />
            </div>
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <button className="bg-white p-2 sm:p-3 rounded-full shadow-md hover:shadow-lg transition-shadow hover:bg-purple-50">
                <Plus className="h-5 w-5 text-purple-600" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {recipe.title}
            </h1>

            {/* Recipe Meta */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-gray-600 text-sm md:text-base">
              {recipe.cookTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>{recipe.cookTime} mins</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>{recipe.ingredientLists.length} ingredients</span>
              </div>
            </div>

            {/* Add to Meal Plan Buttons */}
            <div className="mb-6 md:mb-8 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
                Add to Meal Plan
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                  <button
                    key={mealType}
                    onClick={() => addToMealPlan(mealType)}
                    className="flex-1 md:flex-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Add to {mealType}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Ingredients */}
              <div className="md:col-span-1">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>Ingredients</span>
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {recipe.ingredientLists.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {recipe.ingredientLists.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-0.5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded flex-shrink-0"
                      />
                      <span className="text-gray-700 text-sm md:text-base">
                        {item.quantity
                          ? `${item.quantity} ${item.ingredient.unit || ""} `
                          : ""}
                        <span className="font-medium">{item.ingredient.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                  Instructions
                </h2>
                <div className="space-y-4">
                  {recipe.instructions.split("\n").map((step, index) => {
                    const trimmedStep = step.trim();
                    if (!trimmedStep) return null;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-medium text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed pt-1">
                          {trimmedStep}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
