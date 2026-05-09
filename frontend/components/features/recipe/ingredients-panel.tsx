"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, RefreshCw, Replace } from "lucide-react"

import { Text } from "@/components/ui/typography"
import type { Ingredient } from "@/types/recipe"

import {
  didIngredientScale,
  didIngredientSubstitute,
  formatIngredientAmount,
  formatQuantity,
} from "./recipe-utils"

type IngredientsPanelProps = {
  checkedIngredients: string[]
  ingredients: Ingredient[]
  onToggleIngredient: (ingredientName: string) => void
  originalIngredients?: Ingredient[]
  scaledServings: number | null
}

function IngredientsPanel({
  checkedIngredients,
  ingredients,
  onToggleIngredient,
  originalIngredients = [],
  scaledServings,
}: IngredientsPanelProps) {
  const checked = new Set(checkedIngredients.map((item) => item.toLowerCase()))
  const completion = ingredients.length
    ? Math.round((checkedIngredients.length / ingredients.length) * 100)
    : 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6"
    >
      <div className="mb-6 space-y-4">
        <div className="flex items-end justify-between gap-4">
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

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-hairline-soft">
            <motion.div
              className="h-full rounded-full bg-brand-green"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <Text variant="small" tone="muted" measure="none">
            {completion === 100
              ? "Everything is ready."
              : `${completion}% gathered`}
          </Text>
        </div>

        {scaledServings ? (
          <div className="rounded-lg bg-tint-sky p-3 text-body-sm-medium text-ink">
            Quantities updated for {scaledServings} servings.
          </div>
        ) : null}
      </div>

      <motion.ul layout className="space-y-3">
        {ingredients.map((ingredient, index) => {
          const original = originalIngredients[index]
          const isChecked = checked.has(ingredient.name.toLowerCase())
          const isScaled = didIngredientScale(ingredient, original)
          const isSubstitution = didIngredientSubstitute(ingredient, original)

          return (
            <motion.li
              layout
              key={`${ingredient.name}-${ingredient.unit ?? ""}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025, duration: 0.24 }}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => onToggleIngredient(ingredient.name)}
                className={
                  isChecked
                    ? "motion-standard flex min-h-16 w-full items-start gap-3 rounded-lg border border-brand-green bg-tint-mint p-3 text-left shadow-elevation-1"
                    : "motion-standard flex min-h-16 w-full items-start gap-3 rounded-lg border border-transparent bg-surface-soft p-3 text-left hover:border-hairline-strong hover:bg-canvas"
                }
              >
                <span
                  className={
                    isChecked
                      ? "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-green text-on-dark"
                      : "mt-0.5 size-9 shrink-0 rounded-md border border-hairline-strong bg-canvas"
                  }
                >
                  <AnimatePresence>
                    {isChecked ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                      >
                        <Check className="size-5" />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={
                      isChecked
                        ? "block text-body-md-medium text-ink line-through decoration-brand-green/60"
                        : "block text-body-md-medium text-ink"
                    }
                  >
                    {formatQuantity(ingredient)}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-body-sm text-slate">
                    <span className="capitalize">{ingredient.category}</span>
                    {isScaled && original ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tint-sky px-2 py-0.5 text-body-sm-medium text-ink">
                        <RefreshCw className="size-3.5" />
                        was {formatIngredientAmount(original)}
                      </span>
                    ) : null}
                    {isSubstitution && original ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tint-lavender px-2 py-0.5 text-body-sm-medium text-brand-purple-800">
                        <Replace className="size-3.5" />
                        replaces {original.name}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </motion.li>
          )
        })}
      </motion.ul>
    </motion.section>
  )
}

export { IngredientsPanel }
