"use client"

import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"
import { clearRecipeSession } from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

import { CookingProgress } from "./cooking-progress"
import { IngredientsPanel } from "./ingredients-panel"
import { RecipeHeader } from "./recipe-header"
import { getCurrentStepIndex } from "./recipe-utils"
import { StepsPanel } from "./steps-panel"

type RecipeExperienceProps = {
  originalState: RecipeContext | null
  running: boolean
  state: RecipeContext
  onToggleIngredient: (ingredientName: string) => void
}

function RecipeExperience({
  originalState,
  running,
  state,
  onToggleIngredient,
}: RecipeExperienceProps) {
  const recipe = state.recipe

  if (!recipe) {
    return null
  }

  const currentStepIndex = getCurrentStepIndex(state)

  return (
    <AppShell>
      <ShellMain>
        <Section spacing="lg" className="min-h-screen bg-surface-soft">
          <Container>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <Text variant="caption" measure="none">
                Recipe Companion
              </Text>
              <Button variant="ghost" onClick={clearRecipeSession}>
                <RotateCcw data-icon="inline-start" />
                Upload another
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.15fr)] lg:items-start">
              <div className="space-y-6">
                <RecipeHeader recipe={recipe} running={running} />
                <CookingProgress state={state} />
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
          </Container>
        </Section>
      </ShellMain>
    </AppShell>
  )
}

export { RecipeExperience }
