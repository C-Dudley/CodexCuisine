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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Recipe Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Recipes
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Header */}
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
              <ChefHat className="h-24 w-24 text-gray-400" />
            </div>
            <div className="absolute top-4 right-4">
              <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {recipe.title}
            </h1>

            {/* Recipe Meta */}
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              {recipe.cookTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{recipe.cookTime} minutes</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{recipe.ingredientLists.length} ingredients</span>
              </div>
            </div>

            {/* Add to Meal Plan Buttons */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Add to Meal Plan
              </h3>
              <div className="flex gap-3">
                {["Breakfast", "Lunch", "Dinner"].map((mealType) => (
                  <button
                    key={mealType}
                    onClick={() => addToMealPlan(mealType)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add to {mealType}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ingredients */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ingredients
                </h2>
                <div className="space-y-3">
                  {recipe.ingredientLists.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">
                        {item.quantity
                          ? `${item.quantity} ${item.ingredient.unit || ""}`
                          : item.ingredient.unit || ""}{" "}
                        {item.ingredient.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Instructions
                </h2>
                <div className="prose prose-gray max-w-none">
                  {recipe.instructions.split("\n").map((step, index) => (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 leading-relaxed"
                    >
                      {step.trim()}
                    </p>
                  ))}
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
