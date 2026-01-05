import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const addPreferenceSchema = z.object({
  type: z.string().min(1, "Preference type is required"),
});

const addAllergySchema = z.object({
  ingredient: z.string().min(1, "Ingredient name is required"),
});

// GET user preferences and allergies
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const preferences = await prisma.dietaryPreference.findMany({
        where: { userId },
      });

      const allergies = await prisma.allergy.findMany({
        where: { userId },
      });

      res.json({
        userId,
        preferences,
        allergies,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST - Add dietary preference
router.post(
  "/:userId/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const body = addPreferenceSchema.parse(req.body);

      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if preference already exists
      const existing = await prisma.dietaryPreference.findUnique({
        where: {
          userId_type: {
            userId,
            type: body.type,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Preference already exists" });
      }

      const preference = await prisma.dietaryPreference.create({
        data: {
          type: body.type,
          userId,
        },
      });

      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  }
);

// DELETE - Remove dietary preference
router.delete(
  "/:userId/preferences/:preferenceId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, preferenceId } = req.params;

      // Verify preference belongs to user
      const preference = await prisma.dietaryPreference.findUnique({
        where: { id: preferenceId },
      });

      if (!preference || preference.userId !== userId) {
        return res.status(404).json({ error: "Preference not found" });
      }

      await prisma.dietaryPreference.delete({
        where: { id: preferenceId },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// POST - Add allergy
router.post(
  "/:userId/allergies",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const body = addAllergySchema.parse(req.body);

      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if allergy already exists
      const existing = await prisma.allergy.findUnique({
        where: {
          userId_ingredient: {
            userId,
            ingredient: body.ingredient,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: "Allergy already tracked" });
      }

      const allergy = await prisma.allergy.create({
        data: {
          ingredient: body.ingredient,
          userId,
        },
      });

      res.status(201).json(allergy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  }
);

// DELETE - Remove allergy
router.delete(
  "/:userId/allergies/:allergyId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, allergyId } = req.params;

      // Verify allergy belongs to user
      const allergy = await prisma.allergy.findUnique({
        where: { id: allergyId },
      });

      if (!allergy || allergy.userId !== userId) {
        return res.status(404).json({ error: "Allergy not found" });
      }

      await prisma.allergy.delete({
        where: { id: allergyId },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
