import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateShoppingList } from "../services/shoppingList";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = express.Router();

// Custom error class
class MealPlanError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "MealPlanError";
  }
}

// Validation schemas
const createMealPlanSchema = z
  .object({
    recipeId: z.string().optional(),
    externalRecipeId: z.string().optional(),
    date: z.string().transform((str) => new Date(str)),
    mealType: z.enum(["Breakfast", "Lunch", "Dinner"]),
  })
  .refine((data) => data.recipeId || data.externalRecipeId, {
    message: "Either recipeId or externalRecipeId must be provided",
  });

const updateMealPlanSchema = z.object({
  id: z.string(),
  date: z.string().transform((str) => new Date(str)),
  mealType: z.enum(["Breakfast", "Lunch", "Dinner"]),
});

// Get user's meal plans
router.get("/", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new MealPlanError("Unauthorized", 401);
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: req.user.userId },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            ingredientLists: {
              include: { ingredient: true },
            },
          },
        },
        externalRecipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            externalIngredients: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(mealPlans);
  } catch (error) {
    next(error);
  }
});

// Create a meal plan entry
router.post("/", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new MealPlanError("Unauthorized", 401);
    }

    const { recipeId, externalRecipeId, date, mealType } =
      createMealPlanSchema.parse(req.body);

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: req.user.userId,
        ...(recipeId && { recipeId }),
        ...(externalRecipeId && { externalRecipeId }),
        date,
        mealType,
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            ingredientLists: {
              include: { ingredient: true },
            },
          },
        },
        externalRecipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            externalIngredients: true,
          },
        },
      },
    });

    res.status(201).json(mealPlan);
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new MealPlanError("Recipe not found", 404));
    }
    next(
      new MealPlanError(
        `Failed to create meal plan: ${error.message || "Unknown error"}`,
        400
      )
    );
  }
});

// Update a meal plan entry
router.put("/update", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new MealPlanError("Unauthorized", 401);
    }

    const { id, date, mealType } = updateMealPlanSchema.parse(req.body);

    // Ensure the meal plan belongs to the user (lightweight check)
    const existing = await prisma.mealPlan.findFirst({
      where: { id, userId: req.user.userId },
      select: { id: true },
    });

    if (!existing) {
      throw new MealPlanError("Meal plan not found or access denied", 404);
    }

    const updated = await prisma.mealPlan.update({
      where: { id },
      data: { date, mealType },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            ingredientLists: {
              include: { ingredient: true },
            },
          },
        },
        externalRecipe: {
          select: {
            id: true,
            title: true,
            cookTime: true,
            externalIngredients: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete a meal plan entry
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new MealPlanError("Unauthorized", 401);
    }

    const { id } = req.params;

    // Ensure the meal plan belongs to the user (lightweight check)
    const existing = await prisma.mealPlan.findFirst({
      where: { id, userId: req.user.userId },
      select: { id: true },
    });

    if (!existing) {
      throw new MealPlanError("Meal plan not found or access denied", 404);
    }

    await prisma.mealPlan.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Generate shopping list from meal plan IDs
router.post("/shopping-list", requireAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new MealPlanError("Unauthorized", 401);
    }

    const { mealPlanIds } = z
      .object({
        mealPlanIds: z.array(z.string().uuid()),
      })
      .parse(req.body);

    if (!mealPlanIds || mealPlanIds.length === 0) {
      throw new MealPlanError("No meal plans provided", 400);
    }

    // Ensure all meal plans belong to the user
    const userMealPlans = await prisma.mealPlan.findMany({
      where: {
        id: { in: mealPlanIds },
        userId: req.user.userId,
      },
      select: { id: true },
    });

    if (userMealPlans.length !== mealPlanIds.length) {
      throw new MealPlanError(
        "Access denied to some meal plans or meal plans not found",
        403
      );
    }

    const shoppingList = await generateShoppingList(mealPlanIds);
    res.json(shoppingList);
  } catch (error) {
    next(error);
  }
});

export default router;
