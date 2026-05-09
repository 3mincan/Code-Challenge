type IngredientCategory =
  | "produce"
  | "protein"
  | "dairy"
  | "pantry"
  | "spice"
  | "other"

type Ingredient = {
  name: string
  quantity: number | null
  unit: string | null
  preparation: string | null
  category: IngredientCategory
  substitutes: string[]
}

type RecipeStep = {
  step_number: number
  instruction: string
  duration_minutes: number | null
  timer_label: string | null
  requires_attention: boolean
  tips: string[]
}

type Recipe = {
  title: string
  description: string | null
  servings: number
  original_servings: number | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  difficulty: "easy" | "medium" | "hard"
  cuisine: string | null
  dietary_tags: string[]
  ingredients: Ingredient[]
  steps: RecipeStep[]
}

type RecipeContext = {
  document_text: string | null
  recipe: Recipe | null
  current_step: number
  scaled_servings: number | null
  checked_ingredients: string[]
  cooking_started: boolean
}

type UploadRecipeResponse = {
  threadId: string
  runId: string
  state: RecipeContext
  tools: unknown[]
  context: unknown[]
  forwardedProps: Record<string, unknown>
  messages: unknown[]
}

export type {
  Ingredient,
  IngredientCategory,
  Recipe,
  RecipeContext,
  RecipeStep,
  UploadRecipeResponse,
}
