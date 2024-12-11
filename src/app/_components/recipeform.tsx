"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { CheckboxCard } from "~/components/ui/checkbox-card";
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

export interface RecipeFormData {
  id?: number;
  name: string;
  description: string | null;
  prepTime: number;
  cuisineType: string | null;
  ingredients: {
    ingredientId: number;
    quantity: number;
    unit: string;
  }[];
}

interface RecipeFormProps {
  isEdit?: boolean;
  initialData?: {
    id: number;
    name: string;
    description: string | null;
    prepTime: number;
    cuisineType: string | null;
    recipeIngredients: {
      ingredient: {
        id: number;
        name: string;
      };
      id: number;
      quantity: number;
      unit: string;
    }[];
  };
  onSubmit: (data: RecipeFormData) => void;
}

export function RecipeForm({ isEdit = false, initialData, onSubmit }: RecipeFormProps) {
  const utils = api.useUtils();
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ?? 0);
  const [cuisineType, setCuisineType] = useState(initialData?.cuisineType ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState<Record<number, number>>({});
  const [unit, setUnit] = useState<Record<number, string>>({});
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

  const { data: entries, isLoading } = api.recipe.getAllIngredients.useQuery();

  useEffect(() => {
    if (isEdit && initialData && entries) {
      const initQuantity: Record<number, number> = {};
      const initUnit: Record<number, string> = {};
      const initSelectedIngredients: number[] = [];

      for (const { ingredient, quantity, unit } of initialData.recipeIngredients) {
        const id = ingredient.id;
        initQuantity[id] = quantity;
        initUnit[id] = unit;
        initSelectedIngredients.push(id);
      }

      setQuantity(initQuantity);
      setUnit(initUnit);
      setSelectedIngredients(initSelectedIngredients);
    }
  }, [isEdit, initialData, entries]);

  const createIngredient = api.recipe.createIngredient.useMutation({
    onSuccess: async () => {
      try {
        await utils.recipe.getAllIngredients.invalidate();
        setIngredientName("");
      } catch (error) {
        console.error('Failed to invalidate queries:', error);
      }
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

  const handleSubmit = () => {
    const ingredients = selectedIngredients.map((id) => ({
      ingredientId: id,
      quantity: quantity[id] ?? 0,
      unit: unit[id] ?? "",
    }));

    const formData: RecipeFormData = {
      ...(isEdit && initialData ? { id: initialData.id } : {}),
      name,
      description: description ?? null,
      prepTime,
      cuisineType: cuisineType ?? null,
      ingredients,
    };

    onSubmit(formData);
    window.alert("Recipe saved");
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg">
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
              value={name}
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
              value={description}
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
              value={prepTime}
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
              value={cuisineType}
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
                          value={ingredientName}
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

            {/* ingredient search bar */}
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
                        <CheckboxCard
                          key={entry.id}
                          label={entry.name}
                          checked={selectedIngredients.includes(entry.id)}
                          onChange={() => handleCheckboxChange(entry.id)}
                        />
                      </span>
                      <input
                        type="text"
                        placeholder="Quantity"
                        className="border border-gray-300 rounded p-1"
                        value={quantity[entry.id] ?? ''}
                        onChange={(e) => setQuantity({ ...quantity, [entry.id]: parseInt(e.target.value) })}
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        className="border border-gray-300 rounded p-1"
                        value={unit[entry.id] ?? ''}
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
        <Button className="w-full border border-gray-800 hover:text-white hover:bg-gray-800" onClick={handleSubmit}>
          {isEdit ? "Update" : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}