"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  DialogActionTrigger,
} from "~/components/ui/dialog";

import { RecipeForm } from "./recipeform";

export function CreateRecipe() {
  const utils = api.useUtils();

  const createRecipe = api.recipe.createRecipe.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate();
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
        <RecipeForm
          onSubmit={(data) => createRecipe.mutate(data)}
        />
      </DialogContent>
    </DialogRoot>
  );
}
