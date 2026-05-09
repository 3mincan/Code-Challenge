import type { Ingredient, Recipe, RecipeContext } from "@/types/recipe"

function formatMinutes(value: number | null | undefined) {
  if (!value) {
    return "Flexible"
  }

  if (value < 60) {
    return `${value} min`
  }

  const hours = Math.floor(value / 60)
  const minutes = value % 60

  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`
}

function formatQuantity(ingredient: Ingredient) {
  const parts = [
    ingredient.quantity ?? null,
    ingredient.unit,
    ingredient.name,
    ingredient.preparation,
  ].filter(Boolean)

  return parts.join(" ")
}

function formatIngredientAmount(ingredient: Ingredient) {
  return [ingredient.quantity ?? null, ingredient.unit]
    .filter(Boolean)
    .join(" ")
}

function getIngredientSignature(ingredient: Ingredient | undefined) {
  if (!ingredient) {
    return ""
  }

  return `${ingredient.name.toLowerCase()}|${ingredient.unit ?? ""}|${
    ingredient.quantity ?? ""
  }`
}

function didIngredientScale(
  current: Ingredient,
  original: Ingredient | undefined
) {
  if (!original) {
    return false
  }

  return (
    current.name.toLowerCase() === original.name.toLowerCase() &&
    getIngredientSignature(current) !== getIngredientSignature(original)
  )
}

function didIngredientSubstitute(
  current: Ingredient,
  original: Ingredient | undefined
) {
  if (!original) {
    return false
  }

  return current.name.toLowerCase() !== original.name.toLowerCase()
}

function getTotalTime(recipe: Recipe) {
  const total =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
  return total || null
}

function getCurrentStepIndex(state: RecipeContext) {
  const stepCount = state.recipe?.steps.length ?? 0

  if (!stepCount) {
    return 0
  }

  return Math.min(Math.max(state.current_step, 0), stepCount - 1)
}

function getProgressPercent(state: RecipeContext) {
  const stepCount = state.recipe?.steps.length ?? 0

  if (!stepCount) {
    return 0
  }

  return Math.round(((getCurrentStepIndex(state) + 1) / stepCount) * 100)
}

export {
  didIngredientScale,
  didIngredientSubstitute,
  formatIngredientAmount,
  formatMinutes,
  formatQuantity,
  getCurrentStepIndex,
  getProgressPercent,
  getTotalTime,
}
