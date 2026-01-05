import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Validation schemas
const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const addRecipeSchema = z.object({
  recipeId: z.string(),
});

// Get user's collections
router.get("/", async (req, res, next) => {
  try {
    // In a real app, get userId from JWT
    const userId = "user-id-from-jwt"; // Placeholder

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        recipes: {
          include: {
            recipe: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                _count: {
                  select: { favorites: true },
                },
              },
            },
          },
        },
        _count: {
          select: { recipes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { collections },
    });
  } catch (error) {
    next(error);
  }
});

// Create collection
router.post("/", async (req, res, next) => {
  try {
    // In a real app, get userId from JWT
    const userId = "user-id-from-jwt"; // Placeholder

    const data = createCollectionSchema.parse(req.body);

    const collection = await prisma.collection.create({
      data: {
        ...data,
        userId,
      },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

// Get collection by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        recipes: {
          include: {
            recipe: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
                tags: {
                  include: {
                    tag: true,
                  },
                },
                _count: {
                  select: { favorites: true, ratings: true, reviews: true },
                },
              },
            },
          },
        },
        _count: {
          select: { recipes: true },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

// Update collection
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // In a real app, check if user owns the collection
    const userId = "user-id-from-jwt"; // Placeholder

    const data = createCollectionSchema.partial().parse(req.body);

    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

// Delete collection
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // In a real app, check if user owns the collection
    const userId = "user-id-from-jwt"; // Placeholder

    await prisma.collection.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Add recipe to collection
router.post("/:id/recipes", async (req, res, next) => {
  try {
    const { id } = req.params;
    // In a real app, check if user owns the collection
    const userId = "user-id-from-jwt"; // Placeholder

    const { recipeId } = addRecipeSchema.parse(req.body);

    // Check if recipe exists and is accessible
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    const recipeCollection = await prisma.recipeCollection.create({
      data: {
        recipeId,
        collectionId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: { recipeCollection },
    });
  } catch (error) {
    next(error);
  }
});

// Remove recipe from collection
router.delete("/:id/recipes/:recipeId", async (req, res, next) => {
  try {
    const { id, recipeId } = req.params;
    // In a real app, check if user owns the collection
    const userId = "user-id-from-jwt"; // Placeholder

    await prisma.recipeCollection.deleteMany({
      where: {
        recipeId,
        collectionId: id,
      },
    });

    res.json({
      success: true,
      message: "Recipe removed from collection",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
