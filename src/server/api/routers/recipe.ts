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
});
