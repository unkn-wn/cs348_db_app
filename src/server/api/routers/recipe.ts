import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";

export const recipeRouter = createTRPCRouter({
  createRecipe: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        prepTime: z.number(),
        cuisineType: z.string().optional(),
        ingredients: z.array(
          z.object({
            ingredientId: z.number(),
            quantity: z.number(),
            unit: z.string(),
          })
        ),
      })
    ).mutation(async ({ ctx, input }) => {
      // SERIALIZATION ISOLATION LEVEL - makes sure that no other transactions can
      // modify or read when in progress
      return await ctx.db.$transaction(async (tx) => {
        return tx.recipe.create({
          data: {
            name: input.name,
            description: input.description,
            prepTime: input.prepTime,
            cuisineType: input.cuisineType,
            recipeIngredients: {
              create: input.ingredients.map((ingredient) => ({
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              })),
            }
          },
          include: {
            recipeIngredients: true,
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 5000
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.recipe.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          prepTime: true,
          cuisineType: true,
          ratings: {
            select: {
              score: true,
            },
          },
          recipeIngredients: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
              id: true,
              quantity: true,
              unit: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    } catch (e) {
      console.log("error: ", e);
    }

  }),

  // same as getAll recipes, but selects favoritedby user
  getAllRecipeFavoritedByUser: publicProcedure
    .input(z.object({ userID: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.recipe.findMany({
        where: {
          favoritedBy: {
            some: {
              id: input.userID,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          prepTime: true,
          cuisineType: true,
          ratings: {
            select: {
              score: true,
            },
          },
          recipeIngredients: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
              id: true,
              quantity: true,
              unit: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // SERIALIZATION ISOLATION LEVEL - makes sure that when deleting multiple things,
        // no other transactions can modify or read
        return await ctx.db.$transaction(async (tx) => {
          await tx.recipeIngredient.deleteMany({
            where: { recipeId: input.id },
          });

          await tx.rating.deleteMany({
            where: { recipeId: input.id },
          });

          await tx.recipe.update({
            where: { id: input.id },
            data: {
              favoritedBy: {
                set: [],
              },
            },
          });

          await tx.recipe.delete({
            where: { id: input.id },
          });

          return { success: true, id: input.id };
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 5000
        });
      } catch (e) {
        console.error("Error deleting recipe:", e);
        throw new Error("Failed to delete recipe");
      }
    }),

  createIngredient: publicProcedure
    .input(z.object({
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ingredient.create({
        data: {
          name: input.name,
        },
      });
    }),

  getAllIngredients: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.ingredient.findMany();
    } catch (e) {
      console.log("error: ", e);
    }
  }),

  favoriteRecipe: publicProcedure
    .input(z.object({ recipeID: z.number(), userID: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.recipe.update({
        where: { id: input.recipeID },
        data: {
          favoritedBy: {
            connect: { id: input.userID },
          },
        },
      });
    }),

  // gets the favorite using the user table, select favorites ids
  getAllFavorites: publicProcedure
    .input(z.object({ userID: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userID },
        select: {
          favorites: { select: { id: true } },
        },
      });

      return user?.favorites.map((recipe) => recipe.id) || [];
    }),

  unfavoriteRecipe: publicProcedure
    .input(z.object({ recipeID: z.number(), userID: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.recipe.update({
        where: { id: input.recipeID },
        data: {
          favoritedBy: {
            disconnect: { id: input.userID },
          },
        },
      });
    }),

  addRating: publicProcedure
    .input(z.object({
      recipeId: z.number(),
      userId: z.number(),
      score: z.number().min(1).max(5)
    }))
    .mutation(async ({ ctx, input }) => {
      // REPEATABLE READ ISOLATION LEVEL - we only need to ensure that the ratings read are consistent,
      // (not as important as other transactions)
      return await ctx.db.$transaction(async (tx) => {
        return tx.rating.upsert({
          where: {
            userId_recipeId: {
              userId: input.userId,
              recipeId: input.recipeId,
            },
          },
          update: {
            score: input.score,
          },
          create: {
            userId: input.userId,
            recipeId: input.recipeId,
            score: input.score,
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        timeout: 3000
      });
    }),

  getRecipeRating: publicProcedure
    .input(z.object({
      recipeId: z.number(),
      userId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.rating.findUnique({
        where: {
          userId_recipeId: {
            userId: input.userId,
            recipeId: input.recipeId,
          },
        },
      });
    }),
});
