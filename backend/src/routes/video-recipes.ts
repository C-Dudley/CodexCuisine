import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { scrapeVideoRecipeFromUrl } from "../services/videoRecipeScraper";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const scrapeVideoSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

const searchVideoRecipesSchema = z.object({
  query: z.string().optional(),
  sourceType: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

// GET - Browse video recipes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = searchVideoRecipesSchema.parse(req.query);

    const where: any = {};

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: "insensitive" } },
        { description: { contains: params.query, mode: "insensitive" } },
        { authorName: { contains: params.query, mode: "insensitive" } },
      ];
    }

    if (params.sourceType) {
      where.sourceType = params.sourceType;
    }

    const total = await prisma.videoRecipe.count({ where });

    const videos = await prisma.videoRecipe.findMany({
      where,
      take: params.limit,
      skip: params.offset,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      total,
      limit: params.limit,
      offset: params.offset,
      items: videos,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// GET - Get single video recipe
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const videoRecipe = await prisma.videoRecipe.findUnique({
      where: { id },
    });

    if (!videoRecipe) {
      return res.status(404).json({ error: "Video recipe not found" });
    }

    res.json(videoRecipe);
  } catch (error) {
    next(error);
  }
});

// POST - Scrape recipe from video URL
router.post(
  "/scrape",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = scrapeVideoSchema.parse(req.body);

      // Scrape the recipe
      const scrapedRecipe = await scrapeVideoRecipeFromUrl(url);

      // Create database entry
      const videoRecipe = await prisma.videoRecipe.create({
        data: {
          title: scrapedRecipe.title,
          description: scrapedRecipe.description,
          platform: scrapedRecipe.sourceType.toLowerCase() as "youtube" | "tiktok" | "instagram",
          sourceType: scrapedRecipe.sourceType,
          videoId: scrapedRecipe.videoId,
          sourceUrl: scrapedRecipe.sourceUrl,
          authorName: scrapedRecipe.authorName,
          duration: scrapedRecipe.duration,
          thumbnailUrl: scrapedRecipe.thumbnailUrl,
          ingredients: JSON.stringify(scrapedRecipe.ingredients),
          instructions: JSON.stringify(scrapedRecipe.instructions),
          cookTime: scrapedRecipe.cookTime,
          servings: scrapedRecipe.servings,
          transcript: "", // Will be populated in future versions
        },
      });

      res.status(201).json(videoRecipe);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid input",
          details: error.errors,
        });
      }

      if (error.message?.includes("Unsupported")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message?.includes("Could not extract")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }
);

export default router;
