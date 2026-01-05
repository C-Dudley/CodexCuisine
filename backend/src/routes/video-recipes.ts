import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const extractVideoRecipeSchema = z.object({
  videoUrl: z.string().url("Invalid video URL"),
  platform: z.enum(["YouTube", "TikTok", "Instagram"]),
});

const searchVideoRecipesSchema = z.object({
  platform: z.string().optional(),
  limit: z.coerce.number().optional().default(20),
  offset: z.coerce.number().optional().default(0),
});

// GET - Browse video recipes
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = searchVideoRecipesSchema.parse(req.query);

    const where: any = {};

    if (params.platform) {
      where.platform = params.platform;
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

// GET - Get single video recipe with extracted data
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const videoRecipe = await prisma.videoRecipe.findUnique({
      where: { id },
    });

    if (!videoRecipe) {
      return res.status(404).json({ error: "Video recipe not found" });
    }

    // If recipe was extracted, include the extracted recipe data
    let extractedRecipe = null;
    if (videoRecipe.extractedRecipeId) {
      extractedRecipe = await prisma.externalRecipe.findUnique({
        where: { id: videoRecipe.extractedRecipeId },
        include: { externalIngredients: true },
      });
    }

    res.json({
      ...videoRecipe,
      extractedRecipe,
    });
  } catch (error) {
    next(error);
  }
});

// POST - Extract recipe from video
router.post(
  "/extract",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = extractVideoRecipeSchema.parse(req.body);

      // TODO: Implement actual video extraction logic
      // For now, return a placeholder response

      res.status(501).json({
        error: "Video extraction not yet implemented",
        message:
          "This endpoint will extract recipe data from YouTube, TikTok, Instagram videos",
        videoUrl: body.videoUrl,
        platform: body.platform,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  }
);

export default router;
