import { api, HydrateClient } from "~/trpc/server";

import { MyRecipeList } from "~/app/_components/myrecipes";
import { UserID } from "~/app/_components/userid";

export default async function MyRecipes() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col gap-12 px-4 py-4">
          <UserID />

          {/* Table for SQL */}
          <MyRecipeList />

        </div>
      </main>
    </HydrateClient>
  );
}
