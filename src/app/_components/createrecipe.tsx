"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

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
import { Button } from "~/components/ui/button";
import { CheckboxCard } from "~/components/ui/checkbox-card";


export function CreateRecipe() {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [cuisineType, setCuisineType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // const [userID, setUserID] = useState<number | null>(null);
  // const getUserID = api.account.getUserID.useQuery();

  // useEffect(() => {
  //   if (getUserID.data !== undefined) {
  //     setUserID(getUserID.data.data);
  //   }
  // }, [getUserID.data]);


  const { data: entries, isLoading } = api.recipe.getAllIngredients.useQuery();
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState({} as Record<number, number>);
  const [unit, setUnit] = useState({} as Record<number, string>);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

  const createIngredient = api.recipe.createIngredient.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate();
      setIngredientName("");
    },
  });


  const handleCheckboxChange = (id: number) => {
    setSelectedIngredients((prev) => {
      const newChecked = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      return newChecked;
    });
  };


  const createRecipe = api.recipe.createRecipe.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate();
      setName("");
      setDescription("");
      setPrepTime(0);
      setCuisineType("");
      setSelectedIngredients([]);
      setQuantity({});
      setUnit({});
    },
  });

  const handleSubmit = () => {
    const ingredients = selectedIngredients.map((id) => ({
      ingredientId: id,
      quantity: quantity[id] || 0,
      unit: unit[id] || "",
    }));

    createRecipe.mutate({
      name,
      description,
      prepTime,
      cuisineType,
      ingredients,
    });
  };


  return (
    <>
      <DialogRoot size={"lg"}>
        <DialogTrigger asChild>
          {/* <Button
            size={"lg"}
            className={`border border-gray-800 ${userID === null ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:bg-gray-800'}`}
            disabled={userID === null}
          >
            Add New Recipe
          </Button> */}
          <Button className="border border-gray-800 hover:text-white hover:bg-gray-800">Add New Recipe</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center">Add a New Recipe</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Recipe Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2"
                  placeholder="Enter recipe name"
                  defaultValue={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2"
                  placeholder="Enter a brief description of the recipe"
                  defaultValue={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">
                  Prep Time
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="prepTime"
                  name="prepTime"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2"
                  placeholder="Enter prep time in minutes"
                  defaultValue={prepTime}
                  onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : 0)}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  id="cuisineType"
                  name="cuisineType"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2"
                  placeholder="e.g., Italian, Chinese"
                  defaultValue={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                />
              </div>

              <div className="mb-4 w-full overflow-x-auto">
                <div className="flex flex-row justify-between">
                  <h2 className="text-lg font-semibold">Ingredients</h2>
                  <DialogRoot size={"md"}>
                    <DialogTrigger asChild>
                      <Button className="border border-gray-800 px-4 hover:bg-gray-300">Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Create Ingredient</DialogTitle>
                      </DialogHeader>
                      <DialogBody>
                        {/* Create ingredient */}
                        <form className="space-y-4">
                          <div className="mb-4">
                            <label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">
                              Ingredient Name
                            </label>
                            <input
                              type="text"
                              id="ingredientName"
                              name="ingredientName"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500 p-2"
                              placeholder="Enter ingredient name"
                              defaultValue={ingredientName}
                              onChange={(e) => setIngredientName(e.target.value)}
                            />
                          </div>
                        </form>
                      </DialogBody>
                      <DialogFooter>
                        <DialogActionTrigger asChild>
                          <Button variant="outline" className="bg-red-400 hover:bg-red-500 px-4 text-white">Cancel</Button>
                        </DialogActionTrigger>
                        <Button className="px-16 border border-gray-800 hover:text-white hover:bg-gray-800"
                          onClick={() => createIngredient.mutate({
                            name: ingredientName
                          })} >Save</Button>
                      </DialogFooter>
                      <DialogCloseTrigger />
                    </DialogContent>
                  </DialogRoot>
                </div>

                {/* Add search bar */}
                <div className="my-2">
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex overflow-x-auto gap-2 m-2">
                  {isLoading ? (
                    <div>Loading ingredients...</div>
                  ) : (
                    entries?.filter(entry =>
                        entry.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((entry) => (
                        <div key={entry.id} className="flex flex-col gap-1 w-1/3">
                          <span className="border border-gray-300 rounded">
                            <CheckboxCard key={entry.id} label={entry.name}
                              onChange={() => handleCheckboxChange(entry.id)} />
                          </span>
                          <input
                            type="text"
                            placeholder="Quantity"
                            className="border border-gray-300 rounded p-1"
                            onChange={(e) => setQuantity({ ...quantity, [entry.id]: parseInt(e.target.value) })}
                          />
                          <input
                            type="text"
                            placeholder="Unit"
                            className="border border-gray-300 rounded p-1"
                            onChange={(e) => setUnit({ ...unit, [entry.id]: e.target.value })}
                          />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" className="bg-red-400 hover:bg-red-500 px-4 text-white">Cancel</Button>
            </DialogActionTrigger>
            <Button className="px-16 border border-gray-800 hover:text-white hover:bg-gray-800"
              onClick={handleSubmit}>Save</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
}
