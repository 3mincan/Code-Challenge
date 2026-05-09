import type { RecipeContext } from "@/types/recipe"

const emptyRecipeContext: RecipeContext = {
  document_text: null,
  recipe: null,
  current_step: 0,
  scaled_servings: null,
  checked_ingredients: [],
  cooking_started: false,
}

export { emptyRecipeContext }
