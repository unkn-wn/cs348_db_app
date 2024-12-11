"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { RecipeForm } from "./recipeform";
import { type RecipeFormData } from "./recipeform";

export function CreateRecipe() {
  const utils = api.useUtils();

  const createRecipe = api.recipe.createRecipe.useMutation({
    onSuccess: async () => {
      try {
        await utils.recipe.invalidate();
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
    },
  });

  return (
    <DialogRoot size={"lg"}>
      <DialogTrigger asChild>
        <Button className="border border-gray-800 hover:text-white hover:bg-gray-800">
          Add New Recipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Add a New Recipe</DialogTitle>
        </DialogHeader>
        <RecipeForm onSubmit={(data: RecipeFormData) => createRecipe.mutate(data)} />
      </DialogContent>
    </DialogRoot>
  );
}
