import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";

let userID: number | null = null;

export const accountRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // SERIALIZABLE ISOLATION LEVEL - when creating user, makes sure no one else can
      // edit or read until done
      return await ctx.db.$transaction(async (tx) => {
        return tx.user.create({
          data: {
            username: input.username,
            password: input.password,
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 3000
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
        // SERIALIZABLE ISOLATION LEVEL - makes sure while deleting, nothing else is modifying or reading
        return await ctx.db.$transaction(async (tx) => {
          // remove ratings and then user
          await tx.rating.deleteMany({
            where: { userId: input.id },
          });

          const deletedUser = await tx.user.delete({
            where: { id: input.id },
          });

          if (userID === input.id) {
            userID = null;
          }

          console.log("deleting:", deletedUser);
          return deletedUser;
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 5000
        });
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
