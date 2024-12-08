"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

export function RatingComponent({ recipeId, userId }: { recipeId: number; userId: number }) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const utils = api.useUtils();

  const { data: existingRating } = api.recipe.getRecipeRating.useQuery(
    { recipeId, userId },
    { enabled: !!userId }
  );

  const addRating = api.recipe.addRating.useMutation({
    onSuccess: () => {
      utils.recipe.getRecipeRating.invalidate();
    },
  });

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.score);
    }
  }, [existingRating]);

  const handleRatingClick = (score: number) => {
    setRating(score);
    addRating.mutate({ recipeId, userId, score });
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`text-2xl ${
            star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleRatingClick(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}