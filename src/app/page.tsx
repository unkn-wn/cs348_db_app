import { HydrateClient } from "~/trpc/server";
import { MyRecipeList } from "~/app/_components/myrecipes";
import { CreateRecipe } from "~/app/_components/createrecipe";

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        <div className="container flex flex-col gap-12 px-4 py-4">
          <h1 className="text-3xl font-extrabold tracking-tight">All Recipes</h1>

          <CreateRecipe />

          {/* Table for SQL */}
          <MyRecipeList />

        </div>
      </main>
    </HydrateClient>
  );
}
