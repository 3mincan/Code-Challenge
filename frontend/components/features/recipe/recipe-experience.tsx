"use client"

import { motion } from "framer-motion"
import { ChefHat, RotateCcw } from "lucide-react"
import { useState } from "react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { clearRecipeSession } from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

import { CookingProgress } from "./cooking-progress"
import { IngredientsPanel } from "./ingredients-panel"
import { RecipeHeader } from "./recipe-header"
import { getCurrentStepIndex } from "./recipe-utils"
import { RecipeChefAssistant } from "./recipe-chef-assistant"
import { StepsPanel } from "./steps-panel"

type RecipeExperienceProps = {
  originalState: RecipeContext | null
  running: boolean
  state: RecipeContext
  threadId: string | null
  onToggleIngredient: (ingredientName: string) => void
}

function RecipeExperience({
  originalState,
  running,
  state,
  threadId,
  onToggleIngredient,
}: RecipeExperienceProps) {
  const [cookingMode, setCookingMode] = useState(false)
  const recipe = state.recipe

  if (!recipe) {
    return null
  }

  const currentStepIndex = getCurrentStepIndex(state)

  const sidebar = (
    <div className="space-y-6">
      <RecipeHeader recipe={recipe} running={running} />
      {!cookingMode ? <CookingProgress state={state} /> : null}
      <IngredientsPanel
        checkedIngredients={state.checked_ingredients}
        ingredients={recipe.ingredients}
        onToggleIngredient={onToggleIngredient}
        originalIngredients={
          originalState?.recipe?.ingredients ?? recipe.ingredients
        }
        scaledServings={state.scaled_servings}
      />
    </div>
  )

  return (
    <AppShell>
      <ShellMain>
        <Section spacing="lg" className="min-h-screen bg-surface-soft">
          <Container>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <Text variant="caption" measure="none">
                Recipe Companion
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={cookingMode ? "primary" : "outline"}
                  size="sm"
                  aria-pressed={cookingMode}
                  onClick={() => setCookingMode((open) => !open)}
                >
                  <ChefHat data-icon="inline-start" />
                  {cookingMode ? "Exit cooking mode" : "Cooking mode"}
                </Button>
                <Button variant="ghost" onClick={clearRecipeSession}>
                  <RotateCcw data-icon="inline-start" />
                  Upload another
                </Button>
              </div>
            </div>

            {cookingMode ? (
              <div className="mx-auto max-w-3xl space-y-6">
                <div
                  className={cn(
                    "sticky top-0 z-20 -mx-4 rounded-xl border border-hairline bg-canvas/95 px-4 py-4 shadow-elevation-1 backdrop-blur-sm",
                    "sm:-mx-6 sm:px-6"
                  )}
                >
                  <div className="min-w-0">
                    <Text
                      as="p"
                      variant="small-medium"
                      measure="none"
                      className="truncate text-ink"
                    >
                      {recipe.title}
                    </Text>
                    <Text variant="caption" tone="muted" measure="none">
                      Step {currentStepIndex + 1} of {recipe.steps.length}
                    </Text>
                  </div>
                  <div className="mt-4 border-t border-hairline-soft pt-4">
                    <CookingProgress state={state} compact />
                  </div>
                </div>

                <motion.div
                  key="steps-immersive"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <StepsPanel
                    currentStepIndex={currentStepIndex}
                    steps={recipe.steps}
                    immersive
                  />
                </motion.div>

                <details className="motion-standard rounded-xl border border-hairline bg-canvas shadow-elevation-1 open:shadow-elevation-2">
                  <summary className="cursor-pointer list-none px-5 py-4 text-body-md-medium text-ink outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      Recipe overview and ingredients
                      <span className="text-body-sm font-normal text-slate">
                        Tap to expand
                      </span>
                    </span>
                  </summary>
                  <div className="border-t border-hairline-soft px-5 py-6">
                    {sidebar}
                  </div>
                </details>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.15fr)] lg:items-start">
                <div className="space-y-6">{sidebar}</div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <StepsPanel
                    currentStepIndex={currentStepIndex}
                    steps={recipe.steps}
                  />
                </motion.div>
              </div>
            )}
          </Container>
        </Section>
        <RecipeChefAssistant state={state} threadId={threadId} />
      </ShellMain>
    </AppShell>
  )
}

export { RecipeExperience }
