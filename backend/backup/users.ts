import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get user profile
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            collections: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's recipes
router.get("/:id/recipes", async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: {
          authorId: id,
          isPublic: true,
        },
        include: {
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.recipe.count({
        where: {
          authorId: id,
          isPublic: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's collections
router.get("/:id/collections", async (req, res, next) => {
  try {
    const { id } = req.params;

    const collections = await prisma.collection.findMany({
      where: {
        userId: id,
        isPublic: true,
      },
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

export default router;
