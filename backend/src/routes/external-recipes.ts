import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { isExternalRecipeSafeForUser } from "../services/recipeFilter";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const scrapeRecipeSchema = z.object({
  url: z.string().url("Invalid URL"),
});

const searchExternalRecipesSchema = z.object({
  query: z.string().optional(),
  sourceSite: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
  userId: z.string().optional(), // Optional user ID for filtering by preferences
});

// GET - Search external recipes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = searchExternalRecipesSchema.parse(req.query);

    const where: any = {};

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
      ];
    }

    if (params.sourceSite) {
      where.sourceSite = params.sourceSite;
    }

    const total = await prisma.externalRecipe.count({ where });

    let recipes = await prisma.externalRecipe.findMany({
      where,
      include: {
        externalIngredients: true,
      },
      take: params.limit,
      skip: params.offset,
      orderBy: { createdAt: "desc" },
    });

    // Filter by user allergies if userId provided
    if (params.userId) {
      recipes = await Promise.all(
        recipes.map(async (recipe) => {
          const safety = await isExternalRecipeSafeForUser(recipe.id, params.userId!);
          return { ...recipe, safeForUser: safety.safe, allergenWarning: safety.allergenFound };
        })
      );
      // Optionally filter out unsafe recipes: recipes = recipes.filter(r => r.safeForUser);
    }

    res.json({
      total,
      limit: params.limit,
      offset: params.offset,
      items: recipes,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// GET - Get single external recipe
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.externalRecipe.findUnique({
      where: { id },
      include: {
        externalIngredients: true,
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// POST - Scrape recipe from URL (placeholder for now)
router.post(
  "/scrape",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = scrapeRecipeSchema.parse(req.body);

      // TODO: Implement actual scraping logic
      // For now, return a placeholder response

      res.status(501).json({
        error: "Web scraping not yet implemented",
        message:
          "This endpoint will scrape recipes from AllRecipes, FoodNetwork, etc.",
        url: body.url,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  }
);

// POST - Save external recipe to user collection
router.post(
  "/:id/save",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.headers["x-user-id"] as string; // TODO: Get from auth middleware

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Verify external recipe exists
      const externalRecipe = await prisma.externalRecipe.findUnique({
        where: { id },
        include: { externalIngredients: true },
      });

      if (!externalRecipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      // TODO: Create local Recipe entry with source attribution
      // This will require mapping external ingredients to local ingredient IDs

      res.status(501).json({
        error: "Save functionality not yet implemented",
        message:
          "This endpoint will create a local recipe entry from the external recipe",
        externalRecipeId: id,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
