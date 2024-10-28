import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


let userID: number | null = null;

export const accountRouter = createTRPCRouter({

  create: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          username: input.username,
          password: input.password,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.user.findMany({
        select: {
          username: true,
          password: true,
          id: true,
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
        const deletedUser = await ctx.db.user.delete({
          where: { id: input.id },
        });
        console.log("User deleted:", deletedUser);
        return deletedUser;
      } catch (e) {
        console.error("Error deleting user:", e);
        throw new Error("Failed to delete user");
      }
    }),

  setUserID: publicProcedure
    .input(z.object({ userID: z.number() }))
    .mutation(({ input }) => {
      userID = input.userID;
      return { userID: userID };
    }),

  getUserID: publicProcedure
    .query(() => {
      return { data: userID };
    }),
});
