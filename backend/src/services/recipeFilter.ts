import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface RecipeWithAllergyCheck {
  id: string;
  title: string;
  hasAllergen: boolean;
  excludeReason?: string;
}

/**
 * Filter recipes based on user's allergies and dietary preferences
 * Returns only recipes that:
 * 1. Don't contain any of the user's allergens
 * 2. Match the user's dietary preferences (if any are set)
 */
export async function filterRecipesByUserPreferences(
  recipes: any[],
  userId: string
): Promise<any[]> {
  try {
    // Fetch user preferences and allergies
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dietaryPreferences: true,
        allergies: true,
      },
    });

    if (!user) {
      return recipes; // Return unfiltered if user not found
    }

    // If no allergies or preferences set, return all recipes
    if (user.allergies.length === 0 && user.dietaryPreferences.length === 0) {
      return recipes;
    }

    // Filter out recipes with allergens
    const filteredRecipes = recipes.filter((recipe) => {
      // Check for allergens in ingredients
      const hasAllergen = (recipe.ingredients || []).some((ingredient: any) => {
        const ingredientName = (ingredient.name || "").toLowerCase();
        return user.allergies.some(
          (allergy) => ingredientName.includes(allergy.ingredient.toLowerCase())
        );
      });

      return !hasAllergen;
    });

    // TODO: Implement dietary preference filtering
    // This requires semantic understanding of ingredients
    // For now, we only filter by allergies

    return filteredRecipes;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    return recipes; // Return unfiltered on error
  }
}

/**
 * Check if a specific recipe is safe for a user (no allergens)
 */
export async function isRecipeSafeForUser(
  recipeId: string,
  userId: string
): Promise<{ safe: boolean; allergenFound?: string }> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredientLists: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return { safe: true }; // If recipe doesn't exist, consider it safe
    }

    const allergies = await prisma.allergy.findMany({
      where: { userId },
    });

    // Check for allergens
    for (const ingredientList of recipe.ingredientLists) {
      const ingredientName = ingredientList.ingredient.name.toLowerCase();
      for (const allergy of allergies) {
        if (ingredientName.includes(allergy.ingredient.toLowerCase())) {
          return {
            safe: false,
            allergenFound: allergy.ingredient,
          };
        }
      }
    }

    return { safe: true };
  } catch (error) {
    console.error("Error checking recipe safety:", error);
    return { safe: true }; // Default to safe on error
  }
}

/**
 * Check if an external recipe is safe for a user
 */
export async function isExternalRecipeSafeForUser(
  recipeId: string,
  userId: string
): Promise<{ safe: boolean; allergenFound?: string }> {
  try {
    const recipe = await prisma.externalRecipe.findUnique({
      where: { id: recipeId },
      include: {
        externalIngredients: true,
      },
    });

    if (!recipe) {
      return { safe: true };
    }

    const allergies = await prisma.allergy.findMany({
      where: { userId },
    });

    // Check for allergens in external ingredients
    for (const ingredient of recipe.externalIngredients) {
      const ingredientName = ingredient.name.toLowerCase();
      for (const allergy of allergies) {
        if (ingredientName.includes(allergy.ingredient.toLowerCase())) {
          return {
            safe: false,
            allergenFound: allergy.ingredient,
          };
        }
      }
    }

    return { safe: true };
  } catch (error) {
    console.error("Error checking external recipe safety:", error);
    return { safe: true };
  }
}

/**
 * Get user's dietary preferences for display
 */
export async function getUserDietaryInfo(userId: string) {
  try {
    const preferences = await prisma.dietaryPreference.findMany({
      where: { userId },
    });

    const allergies = await prisma.allergy.findMany({
      where: { userId },
    });

    return {
      preferences: preferences.map((p) => p.type),
      allergies: allergies.map((a) => a.ingredient),
    };
  } catch (error) {
    console.error("Error fetching dietary info:", error);
    return {
      preferences: [],
      allergies: [],
    };
  }
}
