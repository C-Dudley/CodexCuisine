import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { generateShoppingList } from "../services/shoppingList";

const prisma = new PrismaClient();
const router = express.Router();

// Assuming auth middleware sets req.user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
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
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: req.user.id },
      include: {
        recipe: true,
        externalRecipe: {
          include: { externalIngredients: true },
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
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { recipeId, externalRecipeId, date, mealType } =
      createMealPlanSchema.parse(req.body);

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: req.user.id,
        ...(recipeId && { recipeId }),
        ...(externalRecipeId && { externalRecipeId }),
        date,
        mealType,
      },
      include: {
        recipe: true,
        externalRecipe: {
          include: { externalIngredients: true },
        },
      },
    });

    res.status(201).json(mealPlan);
  } catch (error) {
    next(error);
  }
});

// Update a meal plan entry
router.put("/update", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id, date, mealType } = updateMealPlanSchema.parse(req.body);

    // Ensure the meal plan belongs to the user
    const existing = await prisma.mealPlan.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Meal plan not found" });
    }

    const updated = await prisma.mealPlan.update({
      where: { id },
      data: { date, mealType },
      include: { recipe: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete a meal plan entry
router.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params;

    // Ensure the meal plan belongs to the user
    const existing = await prisma.mealPlan.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Meal plan not found" });
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
router.post("/shopping-list", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { mealPlanIds } = z
      .object({
        mealPlanIds: z.array(z.string().uuid()),
      })
      .parse(req.body);

    // Ensure all meal plans belong to the user
    const userMealPlans = await prisma.mealPlan.findMany({
      where: {
        id: { in: mealPlanIds },
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (userMealPlans.length !== mealPlanIds.length) {
      return res
        .status(403)
        .json({ success: false, error: "Access denied to some meal plans" });
    }

    const shoppingList = await generateShoppingList(mealPlanIds);
    res.json(shoppingList);
  } catch (error) {
    next(error);
  }
});

export default router;
