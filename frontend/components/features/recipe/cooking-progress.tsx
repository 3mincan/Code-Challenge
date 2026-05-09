"use client"

import { motion } from "framer-motion"

import { Text } from "@/components/ui/typography"
import type { RecipeContext } from "@/types/recipe"

import { getCurrentStepIndex, getProgressPercent } from "./recipe-utils"

type CookingProgressProps = {
  state: RecipeContext
  /** Dense inline layout for sticky cooking-mode chrome. */
  compact?: boolean
}

function CookingProgress({ state, compact = false }: CookingProgressProps) {
  const recipe = state.recipe

  if (!recipe) {
    return null
  }

  const currentStepIndex = getCurrentStepIndex(state)
  const progress = getProgressPercent(state)
  const currentStep = recipe.steps[currentStepIndex]
  const stepCount = recipe.steps.length

  if (compact) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3 text-body-sm">
          <Text variant="small-medium" measure="none" className="truncate">
            Step {currentStepIndex + 1} of {stepCount}
            {state.cooking_started ? "" : " — ready"}
          </Text>
          <span className="shrink-0 tabular-nums text-body-sm-medium text-ink">
            {progress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-hairline-soft">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {currentStep ? (
          <motion.div
            key={`${currentStepIndex}-${currentStep.instruction.slice(0, 40)}`}
            initial={{ opacity: 0.72, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text
              variant="small"
              tone="muted"
              measure="none"
              className="line-clamp-2"
            >
              {currentStep.instruction}
            </Text>
          </motion.div>
        ) : null}
      </div>
    )
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl bg-brand-navy p-5 text-on-dark shadow-elevation-3 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Text variant="caption" tone="inverse-muted" measure="none">
            Cooking progress
          </Text>
          <motion.div
            key={state.cooking_started ? "cooking" : "idle"}
            initial={{ opacity: 0.88, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Text as="h2" variant="h4" tone="inverse" measure="none">
              {state.cooking_started ? "In progress" : "Ready when you are"}
            </Text>
          </motion.div>
        </div>
        <span className="rounded-full bg-on-dark px-3 py-1 text-body-sm-medium text-ink">
          {progress}%
        </span>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-on-dark/20">
        <motion.div
          className="h-full rounded-full bg-tint-yellow-bold"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <motion.div
        key={currentStepIndex}
        initial={{ opacity: 0.92 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-lg bg-on-dark/10 p-4"
      >
        <Text variant="caption" tone="inverse-muted" measure="none">
          Current step
        </Text>
        <Text
          className="mt-2"
          variant="body-medium"
          tone="inverse"
          measure="none"
        >
          Step {currentStepIndex + 1} of {recipe.steps.length}
        </Text>
        {currentStep ? (
          <motion.div
            key={currentStep.instruction.slice(0, 48)}
            initial={{ opacity: 0.75, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2"
          >
            <Text variant="small" tone="inverse-muted" measure="none">
              {currentStep.instruction}
            </Text>
          </motion.div>
        ) : null}
      </motion.div>
    </motion.aside>
  )
}

export { CookingProgress }
