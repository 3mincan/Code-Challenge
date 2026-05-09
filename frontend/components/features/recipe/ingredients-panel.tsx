"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Text } from "@/components/ui/typography"
import type { Ingredient } from "@/types/recipe"

import { formatQuantity } from "./recipe-utils"

type IngredientsPanelProps = {
  checkedIngredients: string[]
  ingredients: Ingredient[]
}

function IngredientsPanel({
  checkedIngredients,
  ingredients,
}: IngredientsPanelProps) {
  const checked = new Set(checkedIngredients.map((item) => item.toLowerCase()))

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Text variant="caption" measure="none">
            Mise en place
          </Text>
          <Text as="h2" variant="h3" measure="none">
            Ingredients
          </Text>
        </div>
        <Text variant="small-medium" tone="muted" measure="none">
          {checkedIngredients.length}/{ingredients.length}
        </Text>
      </div>

      <ul className="space-y-3">
        {ingredients.map((ingredient) => {
          const isChecked = checked.has(ingredient.name.toLowerCase())

          return (
            <li
              key={`${ingredient.name}-${ingredient.unit ?? ""}`}
              className="flex min-h-14 items-start gap-3 rounded-lg bg-surface-soft p-3"
            >
              <span
                className={
                  isChecked
                    ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-green text-on-dark"
                    : "mt-0.5 size-8 shrink-0 rounded-md border border-hairline-strong bg-canvas"
                }
              >
                {isChecked ? <Check className="size-4" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-body-md-medium text-ink">
                  {formatQuantity(ingredient)}
                </span>
                <span className="text-body-sm capitalize text-slate">
                  {ingredient.category}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </motion.section>
  )
}

export { IngredientsPanel }
