"use client"

import { motion } from "framer-motion"
import { ChefHat, Clock, Flame, UsersRound } from "lucide-react"

import { motionEasings } from "@/components/ui/motion"

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
        <Text as="h1" variant="hero" measure="xl" className="break-words">
          {recipe.title}
        </Text>
        {recipe.description ? (
          <Text variant="subtitle" measure="lg">
            {recipe.description}
          </Text>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: "servings",
            surface: "rounded-lg bg-tint-cream p-4",
            icon: <UsersRound className="mb-4 size-5 text-brand-purple" />,
            caption: "Servings",
            body: (
              <motion.div
                key={recipe.servings}
                initial={{ scale: 0.94, opacity: 0.82 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 440,
                  damping: 28,
                }}
              >
                <Text variant="h4" measure="none">
                  {recipe.servings}
                </Text>
              </motion.div>
            ),
          },
          {
            key: "total",
            surface: "rounded-lg bg-tint-sky p-4",
            icon: <Clock className="mb-4 size-5 text-link-blue" />,
            caption: "Total time",
            body: (
              <Text variant="h4" measure="none">
                {formatMinutes(totalTime)}
              </Text>
            ),
          },
          {
            key: "prep",
            surface: "rounded-lg bg-tint-peach p-4",
            icon: <ChefHat className="mb-4 size-5 text-brand-orange" />,
            caption: "Prep",
            body: (
              <Text variant="h4" measure="none">
                {formatMinutes(recipe.prep_time_minutes)}
              </Text>
            ),
          },
          {
            key: "cook",
            surface: "rounded-lg bg-tint-rose p-4",
            icon: <Flame className="mb-4 size-5 text-brand-pink" />,
            caption: "Cook",
            body: (
              <Text variant="h4" measure="none">
                {formatMinutes(recipe.cook_time_minutes)}
              </Text>
            ),
          },
        ].map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.34,
              ease: motionEasings.emphasized,
              delay: 0.05 + index * 0.06,
            }}
            className={card.surface}
          >
            {card.icon}
            <Text variant="caption" measure="none">
              {card.caption}
            </Text>
            {card.body}
          </motion.div>
        ))}
      </div>
    </motion.header>
  )
}

export { RecipeHeader }
