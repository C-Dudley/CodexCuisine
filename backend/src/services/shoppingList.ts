import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const generateShoppingListSchema = z.array(z.string().uuid());

export interface ShoppingListItem {
  name: string;
  totalQty: number;
  unit: string;
}

export interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

export async function generateShoppingList(
  mealPlanIds: string[]
): Promise<ShoppingListCategory[]> {
  // Validate input
  const ids = generateShoppingListSchema.parse(mealPlanIds);

  const prisma = new PrismaClient();

  try {
    // Fetch meal plans with recipes and their ingredient lists
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        recipe: {
          include: {
            ingredientLists: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // Flatten all ingredient lists
    const allIngredientLists = mealPlans.flatMap(
      (mealPlan) => mealPlan.recipe.ingredientLists
    );

    // Group by ingredient ID and unit to handle consolidation
    const groupedIngredients = new Map<
      string,
      {
        ingredient: {
          id: string;
          name: string;
          unit: string | null;
          category: string | null;
        };
        quantities: number[];
      }
    >();

    allIngredientLists.forEach((ingredientList) => {
      const unit = ingredientList.ingredient.unit || "no-unit";
      const key = `${ingredientList.ingredientId}-${unit}`;

      if (!groupedIngredients.has(key)) {
        groupedIngredients.set(key, {
          ingredient: ingredientList.ingredient,
          quantities: [],
        });
      }

      if (ingredientList.quantity !== null) {
        groupedIngredients.get(key)!.quantities.push(ingredientList.quantity);
      }
    });

    // Sum quantities for each group
    const consolidatedItems = Array.from(groupedIngredients.entries()).map(
      ([, { ingredient, quantities }]) => ({
        name: ingredient.name,
        totalQty: quantities.reduce((sum, qty) => sum + qty, 0),
        unit: ingredient.unit || "",
        category: ingredient.category || "Uncategorized",
      })
    );

    // Group by category
    const categoryGroups = new Map<string, ShoppingListItem[]>();

    consolidatedItems.forEach((item) => {
      const category = item.category;
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push({
        name: item.name,
        totalQty: item.totalQty,
        unit: item.unit,
      });
    });

    // Convert to final format
    const result: ShoppingListCategory[] = Array.from(
      categoryGroups.entries()
    ).map(([category, items]) => ({
      category,
      items,
    }));

    return result;
  } finally {
    await prisma.$disconnect();
  }
}
