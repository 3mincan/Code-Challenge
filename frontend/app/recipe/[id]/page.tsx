"use client"

import { useParams } from "next/navigation"

import { RecipeWorkspace } from "@/components/features/recipe/recipe-workspace"

export default function RecipePage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : null

  if (!id) {
    return null
  }

  return <RecipeWorkspace recipeId={id} />
}
