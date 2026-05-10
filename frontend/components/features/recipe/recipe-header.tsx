"use client"

import { motion } from "framer-motion"
import { Clock, UsersRound } from "lucide-react"

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
  const prepM = recipe.prep_time_minutes
  const cookM = recipe.cook_time_minutes
  const prepCookLine = [
    prepM != null && prepM > 0 ? `Prep ${formatMinutes(prepM)}` : null,
    cookM != null && cookM > 0 ? `Cook ${formatMinutes(cookM)}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-8 sm:gap-y-3">
        <Text
          as="h1"
          variant="hero"
          measure="xl"
          className="min-w-0 max-w-4xl shrink break-words font-bold sm:flex-1"
        >
          {recipe.title}
        </Text>
        <div className="flex flex-wrap items-center gap-2 sm:max-w-[min(100%,26rem)] sm:shrink-0 sm:justify-end">
          <Badge variant={running ? "orange" : "tag-purple"}>
            {running ? "Syncing" : "Ready to cook"}
          </Badge>
          {recipe.cuisine ? (
            <Badge variant="tag-orange">{recipe.cuisine}</Badge>
          ) : null}
          <Badge variant="tag-green">{recipe.difficulty}</Badge>
        </div>
      </div>

      {recipe.description ? (
        <Text variant="subtitle" measure="lg" className="max-w-3xl">
          {recipe.description}
        </Text>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-hairline-soft/90 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <motion.div
            key={recipe.servings}
            initial={{ scale: 0.96, opacity: 0.88 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 440, damping: 30 }}
            className="inline-flex items-center gap-2 rounded-full border border-hairline-soft bg-tint-cream/90 px-3.5 py-2 text-body-sm shadow-elevation-1"
          >
            <UsersRound
              className="size-4 shrink-0 text-brand-purple"
              aria-hidden
            />
            <span className="text-slate">Servings</span>
            <span className="font-semibold tabular-nums text-ink">
              {recipe.servings}
            </span>
          </motion.div>
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline-soft bg-tint-sky/90 px-3.5 py-2 text-body-sm shadow-elevation-1">
            <Clock className="size-4 shrink-0 text-link-blue" aria-hidden />
            <span className="text-slate">Total</span>
            <span className="font-semibold tabular-nums text-ink">
              {formatMinutes(totalTime)}
            </span>
          </div>
        </div>
        {prepCookLine ? (
          <Text variant="small" tone="muted" measure="none" className="sm:ml-1">
            {prepCookLine}
          </Text>
        ) : null}
      </div>
    </motion.header>
  )
}

export { RecipeHeader }
