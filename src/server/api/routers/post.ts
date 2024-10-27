import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //       },
  //     });
  //   }),

  // getLatest: publicProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //   });

  //   return post ?? null;
  // }),

  // getAll: publicProcedure.query(async ({ ctx }) => {
  //   try {
  //     return await ctx.db.post.findMany({
  //       select: {
  //         name: true,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     });
  //   } catch (e) {
  //     console.log("error: ", e);
  //   }

  // }),
});
