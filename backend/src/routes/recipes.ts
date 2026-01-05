import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Validation schemas
const createRecipeSchema = z.object({
  title: z.string().min(1).max(200),
  instructions: z.string().min(1),
  cookTime: z.number().optional(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string(),
        quantity: z.number().optional(),
      })
    )
    .optional(),
});

const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// Get all recipes
router.get("/", async (req, res, next) => {
  try {
    const { query, page, limit } = searchSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { instructions: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredientLists: {
          include: {
            ingredient: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.recipe.count({ where });

    res.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get recipe by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredientLists: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Create recipe
router.post("/", async (req, res, next) => {
  try {
    const { title, instructions, cookTime, ingredients } =
      createRecipeSchema.parse(req.body);

    const recipe = await prisma.recipe.create({
      data: {
        title,
        instructions,
        cookTime,
      },
      include: {
        ingredientLists: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Add ingredients if provided
    if (ingredients && ingredients.length > 0) {
      await prisma.ingredientList.createMany({
        data: ingredients.map((ing) => ({
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
        })),
      });

      // Re-fetch with ingredients
      const recipeWithIngredients = await prisma.recipe.findUnique({
        where: { id: recipe.id },
        include: {
          ingredientLists: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      return res.status(201).json(recipeWithIngredients);
    }

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

// Update recipe
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, instructions, cookTime, ingredients } =
      createRecipeSchema.parse(req.body);

    // Update recipe
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        instructions,
        cookTime,
      },
      include: {
        ingredientLists: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Update ingredients if provided
    if (ingredients) {
      // Delete existing ingredients
      await prisma.ingredientList.deleteMany({
        where: { recipeId: id },
      });

      // Add new ingredients
      if (ingredients.length > 0) {
        await prisma.ingredientList.createMany({
          data: ingredients.map((ing) => ({
            recipeId: id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          })),
        });
      }

      // Re-fetch with ingredients
      const recipeWithIngredients = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredientLists: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      return res.json(recipeWithIngredients);
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Delete recipe
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.recipe.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
