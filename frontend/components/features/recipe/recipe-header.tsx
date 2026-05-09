"use client"

import { motion } from "framer-motion"
import { ChefHat, Clock, Flame, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/surface"
import { Text } from "@/components/ui/typography"
import type { Recipe } from "@/types/recipe"

import { formatMinutes, getTotalTime } from "./recipe-utils"

type RecipeHeaderProps = {
  recipe: Recipe
  running: boolean
}

function RecipeHeader({ recipe, running }: RecipeHeaderProps) {
  const totalTime = getTotalTime(recipe)

  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={running ? "orange" : "tag-purple"}>
          {running ? "Syncing" : "Ready to cook"}
        </Badge>
        {recipe.cuisine ? (
          <Badge variant="tag-orange">{recipe.cuisine}</Badge>
        ) : null}
        <Badge variant="tag-green">{recipe.difficulty}</Badge>
      </div>

      <div className="space-y-4">
        <Text as="h1" variant="hero" measure="xl">
          {recipe.title}
        </Text>
        {recipe.description ? (
          <Text variant="subtitle" measure="lg">
            {recipe.description}
          </Text>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-tint-cream p-4">
          <UsersRound className="mb-4 size-5 text-brand-purple" />
          <Text variant="caption" measure="none">
            Servings
          </Text>
          <Text variant="h4" measure="none">
            {recipe.servings}
          </Text>
        </div>
        <div className="rounded-lg bg-tint-sky p-4">
          <Clock className="mb-4 size-5 text-link-blue" />
          <Text variant="caption" measure="none">
            Total time
          </Text>
          <Text variant="h4" measure="none">
            {formatMinutes(totalTime)}
          </Text>
        </div>
        <div className="rounded-lg bg-tint-peach p-4">
          <ChefHat className="mb-4 size-5 text-brand-orange" />
          <Text variant="caption" measure="none">
            Prep
          </Text>
          <Text variant="h4" measure="none">
            {formatMinutes(recipe.prep_time_minutes)}
          </Text>
        </div>
        <div className="rounded-lg bg-tint-rose p-4">
          <Flame className="mb-4 size-5 text-brand-pink" />
          <Text variant="caption" measure="none">
            Cook
          </Text>
          <Text variant="h4" measure="none">
            {formatMinutes(recipe.cook_time_minutes)}
          </Text>
        </div>
      </div>
    </motion.header>
  )
}

export { RecipeHeader }
