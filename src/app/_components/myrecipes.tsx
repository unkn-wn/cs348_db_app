"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Table } from "@chakra-ui/react"
import { RatingComponent } from "./ratingcomponent";
import { RecipeForm, type RecipeFormData } from "./recipeform";


export function MyRecipeList({ mylist = false }: { mylist?: boolean }) {
  const utils = api.useUtils();

  const [userID, setUserID] = useState<number | null>(null);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  // get user id
  const getUserID = api.account.getUserID.useQuery();
  useEffect(() => {
    if (getUserID.data?.data) {
      setUserID(getUserID.data.data);
    }
  }, [getUserID.data]);

  // get all unique cuisines using getAll
  const allRecipes = api.recipe.getAll.useQuery().data;
  const uniqueCuisines = allRecipes
    ? Array.from(new Set(allRecipes.map((recipe) => recipe.cuisineType?.toLowerCase())))
    : [];

  // if mylist, get only favorites for the user
  const { data: recipes, isLoading } = mylist
    ? api.recipe.getAllRecipeFavoritedByUser.useQuery({ userID: userID ?? 0 }, { enabled: !!userID })
    : api.recipe.getAllFiltered.useQuery({
      cuisineType: cuisineFilter,
      minRating: ratingFilter
    });

  // get favorite recipes
  const { data: favoriteRecipeData } = api.recipe.getAllFavorites.useQuery(
    { userID: userID ?? 0 },
    { enabled: !!userID }
  );
  useEffect(() => {
    if (favoriteRecipeData) {
      setFavoriteRecipeIds(favoriteRecipeData);
    }
  }, [favoriteRecipeData]);


  // favorite/unfavorite
  const favoriteRecipe = api.recipe.favoriteRecipe.useMutation({
    onSuccess: async ({ id: recipeID }) => {
      setFavoriteRecipeIds((prev) => [...prev, recipeID]);
      try {
        await Promise.all([
          utils.recipe.getAllRecipeFavoritedByUser.invalidate(),
          utils.recipe.getAll.invalidate(),
          utils.recipe.getAllFiltered.invalidate(),
          utils.recipe.getAllFavorites.invalidate()
        ]);
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
    },
  });

  const unfavoriteRecipe = api.recipe.unfavoriteRecipe.useMutation({
    onSuccess: async ({ id: recipeID }) => {
      setFavoriteRecipeIds((prev) => prev.filter((id) => id !== recipeID));
      try {
        await Promise.all([
          utils.recipe.getAllRecipeFavoritedByUser.invalidate(),
          utils.recipe.getAll.invalidate(),
          utils.recipe.getAllFiltered.invalidate(),
          utils.recipe.getAllFavorites.invalidate()
        ]);
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
    },
  });

  const deleteRecipe = api.recipe.delete.useMutation({
    onSuccess: async () => {
      try {
        await Promise.all([
          utils.recipe.getAllRecipeFavoritedByUser.invalidate(),
          utils.recipe.getAllFiltered.invalidate(),
          utils.recipe.getAll.invalidate(),
          utils.recipe.getAllFavorites.invalidate()
        ]);
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
    },
  });

  const updateRecipe = api.recipe.updateRecipe.useMutation({
    onSuccess: async () => {
      try {
        await Promise.all([
          utils.recipe.getAllRecipeFavoritedByUser.invalidate(),
          utils.recipe.getAllFiltered.invalidate(),
          utils.recipe.getAll.invalidate()
        ]);
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
    },
  });

  const handleUpdateRecipe = (data: RecipeFormData) => {
    if (!data.id) {
      console.error('Recipe ID is required for updates');
      return;
    }

    updateRecipe.mutate({...data, id: data.id});
  };

  const isFavorite = (recipeID: number) => favoriteRecipeIds.includes(recipeID);


  if (isLoading) return <div>Fetching all entries...</div>;

  return (
    <div className="flex flex-col gap-4">
      {!mylist && (
        <div className="flex gap-4 items-center">
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Cuisines</option>
            {uniqueCuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={0}>All Ratings (Avg)</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </div>
      )}

      <div className="overflow-x-auto min-w-full border border-grey-800">
        <DialogRoot size={"md"}>
          <Table.Root size="lg" striped variant={"line"}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Recipe Name</Table.ColumnHeader>
                <Table.ColumnHeader>Prep Time (mins)</Table.ColumnHeader>
                <Table.ColumnHeader>Cuisine</Table.ColumnHeader>
                <Table.ColumnHeader>Avg Rating</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {recipes?.map((recipe) => {
                const avgRating = recipe.ratings.length > 0
                  ? (recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length).toFixed(1)
                  : '-';

                return (
                  <Table.Row key={recipe.id}>
                    <DialogRoot>
                      <DialogTrigger asChild className="cursor-pointer underline">
                        <Table.Cell>{recipe.name}</Table.Cell>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <div className="w-full flex flex-col">
                            <DialogTitle className="text-3xl font-bold text-center">{recipe.name}</DialogTitle>
                            {userID && (
                              <div className="w-1/4 self-center">
                                {isFavorite(recipe.id) ? (
                                  <button className="w-full border border-gray-800 px-2 hover:bg-gray-800 hover:text-white rounded transition"
                                    onClick={() => unfavoriteRecipe.mutate({ recipeID: recipe.id, userID: userID })}>Unfavorite</button>
                                ) : (
                                  <button className="w-full border border-gray-800 px-2 hover:bg-gray-800 hover:text-white rounded transition"
                                    onClick={() => favoriteRecipe.mutate({ recipeID: recipe.id, userID: userID })}>Favorite</button>
                                )}
                              </div>
                            )}
                          </div>
                        </DialogHeader>
                        <DialogBody>
                          <div className="flex flex-col">
                            <div className="flex flex-row justify-between">
                              <p className="font-bold">{recipe.prepTime} minutes</p>
                              <p className="font-bold">{recipe.cuisineType}</p>
                            </div>
                            {mylist && userID && (
                              <div className="w-full flex justify-center">
                                <RatingComponent recipeId={recipe.id} userId={userID} />
                              </div>
                            )}
                            <p className="mt-2">{recipe.description}</p>
                            {recipe.recipeIngredients.length > 0 && (
                              <div className="mt-4">
                                <h3 className="font-semibold">Ingredients:</h3>
                                <ul>
                                  {recipe.recipeIngredients.map((ingredient) => (
                                    <li key={ingredient.id}>
                                      {ingredient.ingredient.name} - {ingredient.quantity} {ingredient.unit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* DELETE AND EDIT RECIPE */}
                            <div className="mt-4 flex justify-center gap-4">
                              <DialogRoot size={"lg"}>
                                <DialogTrigger asChild>
                                  <button className="px-4 py-2 border border-gray-800 rounded hover:text-white hover:bg-gray-800">
                                    Edit Recipe
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-center">Edit Recipe</DialogTitle>
                                  </DialogHeader>
                                  <RecipeForm
                                    isEdit={true}
                                    initialData={recipe}
                                    onSubmit={handleUpdateRecipe}
                                  />
                                </DialogContent>
                              </DialogRoot>
                              <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this recipe?')) {
                                    deleteRecipe.mutate({ id: recipe.id });
                                  }
                                }}
                              >
                                Delete Recipe
                              </button>
                            </div>
                          </div>
                        </DialogBody>
                      </DialogContent>
                    </DialogRoot>
                    <Table.Cell>{recipe.prepTime}</Table.Cell>
                    <Table.Cell>{recipe.cuisineType}</Table.Cell>
                    <Table.Cell>{avgRating}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>

        </DialogRoot>
      </div>
    </div >
  );
}