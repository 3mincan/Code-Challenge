"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChefHat, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { useState } from "react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { panelCrossfade } from "@/components/ui/motion"
import { TactileButton } from "@/components/ui/tactile-button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { clearRecipeSession } from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

import { CookingProgress } from "./cooking-progress"
import { CookingVoiceControl } from "./cooking-voice-control"
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
  onGoToStep: (stepIndex: number) => void
}

function RecipeExperience({
  originalState,
  running,
  state,
  threadId,
  onToggleIngredient,
  onGoToStep,
}: RecipeExperienceProps) {
  const [cookingMode, setCookingMode] = useState(false)
  const recipe = state.recipe

  if (!recipe) {
    return null
  }

  const currentStepIndex = getCurrentStepIndex(state)
  const currentStepInstruction =
    recipe.steps[currentStepIndex]?.instruction ?? ""

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
        agentBusy={running}
      />
    </div>
  )

  return (
    <AppShell>
      <ShellMain>
        <Section
          spacing="lg"
          className={cn(
            "min-h-screen",
            cookingMode ? "bg-canvas" : "bg-surface-soft"
          )}
        >
          <Container>
            <AnimatePresence mode="wait" initial={false}>
              {cookingMode ? (
                <motion.div
                  key="cooking"
                  {...panelCrossfade}
                  className="mx-auto max-w-2xl space-y-5 pb-[max(5rem,env(safe-area-inset-bottom,0px)+2.5rem)] pt-2 sm:space-y-6 sm:pb-[max(5.5rem,env(safe-area-inset-bottom,0px)+2.5rem)]"
                >
                <div
                  role="region"
                  aria-label="Cooking mode controls"
                  className={cn(
                    "sticky top-0 z-30 -mx-4 space-y-3 sm:-mx-6"
                  )}
                >
                  <div className="rounded-2xl border border-hairline/80 bg-canvas/95 px-2 py-2 shadow-elevation-2 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/90">
                    <div className="flex items-start gap-2 sm:items-center sm:gap-2">
                      <CookingVoiceControl
                        currentStepIndex={currentStepIndex}
                        stepCount={recipe.steps.length}
                        currentStepInstruction={currentStepInstruction}
                        onGoToStep={onGoToStep}
                        agentBusy={running}
                      />
                      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                        <TactileButton
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-12 shrink-0 touch-manipulation rounded-xl"
                          aria-label="Previous step"
                          disabled={currentStepIndex <= 0}
                          onClick={() => onGoToStep(currentStepIndex - 1)}
                        >
                          <ChevronLeft className="size-6" strokeWidth={2} />
                        </TactileButton>
                        <div className="min-w-0 flex-1 px-1 text-center">
                          <Text
                            as="p"
                            variant="small-medium"
                            measure="none"
                            className="truncate text-ink"
                          >
                            {recipe.title}
                          </Text>
                          <Text variant="caption" tone="muted" measure="none">
                            Step {currentStepIndex + 1} of{" "}
                            {recipe.steps.length}
                          </Text>
                        </div>
                        <TactileButton
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-12 shrink-0 touch-manipulation rounded-xl"
                          aria-label="Next step"
                          disabled={
                            currentStepIndex >= recipe.steps.length - 1
                          }
                          onClick={() => onGoToStep(currentStepIndex + 1)}
                        >
                          <ChevronRight className="size-6" strokeWidth={2} />
                        </TactileButton>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-hairline-soft px-1 pt-3">
                      <CookingProgress state={state} compact />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 px-1 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-12 touch-manipulation sm:min-h-11"
                      onClick={() => {
                        setCookingMode(false)
                      }}
                    >
                      Exit cooking mode
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-12 touch-manipulation text-slate sm:min-h-11"
                      onClick={clearRecipeSession}
                    >
                      <RotateCcw data-icon="inline-start" />
                      New recipe
                    </Button>
                  </div>
                </div>

                <StepsPanel
                  currentStepIndex={currentStepIndex}
                  steps={recipe.steps}
                  immersive
                  agentBusy={running}
                  onStepChange={onGoToStep}
                />

                <details
                  className={cn(
                    "motion-standard rounded-2xl border border-hairline/80 bg-surface-soft/70 shadow-elevation-1",
                    "open:bg-canvas open:shadow-elevation-2",
                    "transition-[opacity,background-color,box-shadow] duration-300",
                    "opacity-[0.88] open:opacity-100",
                    "focus-within:ring-2 focus-within:ring-ring/30"
                  )}
                >
                  <summary className="min-h-12 cursor-pointer list-none px-5 py-4 text-body-md-medium text-ink outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">
                      Recipe and ingredients
                      <span className="text-body-sm font-normal text-slate">
                        Expand
                      </span>
                    </span>
                  </summary>
                  <div className="border-t border-hairline-soft px-5 py-6">
                    {sidebar}
                  </div>
                </details>
                </motion.div>
              ) : (
                <motion.div
                  key="browse"
                  {...panelCrossfade}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Text variant="caption" measure="none">
                      Recipe Companion
                    </Text>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-pressed={cookingMode}
                        onClick={() => setCookingMode((open) => !open)}
                      >
                        <ChefHat data-icon="inline-start" />
                        Cooking mode
                      </Button>
                      <Button variant="ghost" onClick={clearRecipeSession}>
                        <RotateCcw data-icon="inline-start" />
                        Upload another
                      </Button>
                    </div>
                  </div>

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
                        agentBusy={running}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </Section>
        <RecipeChefAssistant state={state} threadId={threadId} />
      </ShellMain>
    </AppShell>
  )
}

export { RecipeExperience }
