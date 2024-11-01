import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


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
      return ctx.db.recipe.create({
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
        const recipe = await ctx.db.recipe.delete({
          where: { id: input.id },
        });
        console.log("Recipe deleted:", recipe);
        return recipe;
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
});
