"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChefHat, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { panelCrossfade } from "@/components/ui/motion"
import { TactileButton } from "@/components/ui/tactile-button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
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
  const router = useRouter()
  const [cookingMode, setCookingMode] = useState(false)
  const recipe = state.recipe

  if (!recipe) {
    return null
  }

  const currentStepIndex = getCurrentStepIndex(state)
  const currentStepInstruction =
    recipe.steps[currentStepIndex]?.instruction ?? ""

  const sidebar = (
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
  )

  const recipeMetaAndIngredients = (
    <div className="space-y-6">
      <RecipeHeader recipe={recipe} running={running} />
      {sidebar}
    </div>
  )

  return (
    <AppShell>
      <ShellMain>
        <Section
          spacing="lg"
          className={cn(
            "min-h-screen overflow-x-hidden",
            cookingMode ? "bg-canvas" : "bg-surface-soft"
          )}
        >
          <Container>
            <AnimatePresence mode="wait" initial={false}>
              {cookingMode ? (
                <motion.div
                  key="cooking"
                  {...panelCrossfade}
                  className="mx-auto max-w-2xl space-y-4 pb-[max(5rem,env(safe-area-inset-bottom,0px)+2.5rem)] pt-1 sm:space-y-5 sm:pb-[max(5.5rem,env(safe-area-inset-bottom,0px)+2.5rem)]"
                >
                  <section
                    aria-label="Cooking mode controls"
                    className="sticky top-0 z-30 -mx-2 space-y-3 sm:-mx-4 md:-mx-6"
                  >
                    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-1 sm:px-0">
                      <Text
                        as="p"
                        variant="caption"
                        measure="none"
                        className="font-semibold uppercase tracking-[0.14em]"
                      >
                        Cooking
                      </Text>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-10 touch-manipulation sm:min-h-9"
                          onClick={() => {
                            setCookingMode(false)
                          }}
                        >
                          Exit cooking mode
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-10 touch-manipulation text-slate sm:min-h-9"
                          onClick={() => {
                            router.push("/")
                          }}
                        >
                          <RotateCcw data-icon="inline-start" aria-hidden />
                          New recipe
                        </Button>
                      </div>
                    </header>

                    <div className="overflow-hidden rounded-[1.25rem] border border-hairline/80 bg-canvas/95 shadow-elevation-2 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/88">
                      <div className="flex items-center justify-between gap-2 border-b border-hairline-soft/80 p-3 sm:gap-4 sm:p-4">
                        <CookingVoiceControl
                          currentStepIndex={currentStepIndex}
                          stepCount={recipe.steps.length}
                          currentStepInstruction={currentStepInstruction}
                          onGoToStep={onGoToStep}
                          agentBusy={running}
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
                          <Text
                            as="p"
                            variant="h4"
                            measure="none"
                            className="line-clamp-2 text-balance font-semibold leading-snug tracking-tight text-ink"
                          >
                            {recipe.title}
                          </Text>
                        </div>
                        <div className="flex shrink-0 flex-col justify-center gap-1.5">
                          <TactileButton
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 touch-manipulation rounded-xl sm:size-12"
                            aria-label="Previous step"
                            disabled={currentStepIndex <= 0}
                            onClick={() => onGoToStep(currentStepIndex - 1)}
                          >
                            <ChevronUp
                              className="size-5 sm:size-6"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </TactileButton>
                          <TactileButton
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-11 touch-manipulation rounded-xl sm:size-12"
                            aria-label="Next step"
                            disabled={
                              currentStepIndex >= recipe.steps.length - 1
                            }
                            onClick={() => onGoToStep(currentStepIndex + 1)}
                          >
                            <ChevronDown
                              className="size-5 sm:size-6"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </TactileButton>
                        </div>
                      </div>
                      <div className="border-b border-hairline-soft/65 bg-canvas/55 px-3 py-2.5 sm:px-4">
                        <CookingProgress state={state} compact />
                      </div>
                      <div className="bg-surface-soft/15 px-0.5 pb-1 pt-0 sm:px-1 sm:pb-2">
                        <StepsPanel
                          currentStepIndex={currentStepIndex}
                          steps={recipe.steps}
                          immersive
                          embedded
                          agentBusy={running}
                          onStepChange={onGoToStep}
                        />
                      </div>
                    </div>
                  </section>

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
                    {recipeMetaAndIngredients}
                  </div>
                </details>
                </motion.div>
              ) : (
                <motion.div
                  key="browse"
                  {...panelCrossfade}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                    <Text variant="caption" measure="none">
                      Recipe Companion
                    </Text>
                    <div className="flex w-full flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap sm:w-auto sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-pressed={cookingMode}
                        onClick={() => setCookingMode((open) => !open)}
                      >
                        <ChefHat data-icon="inline-start" />
                        Cooking mode
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push("/")
                        }}
                      >
                        <RotateCcw data-icon="inline-start" />
                        Upload another
                      </Button>
                    </div>
                  </div>

                  <RecipeHeader recipe={recipe} running={running} />

                  <div className="grid gap-6 max-md:gap-8 md:gap-8 lg:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-10">
                    <div className="order-2 min-w-0 lg:order-1">
                      {sidebar}
                    </div>

                    <motion.div
                      className="order-1 flex min-w-0 flex-col gap-6 lg:order-2"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <CookingProgress state={state} />
                      <StepsPanel
                        currentStepIndex={currentStepIndex}
                        steps={recipe.steps}
                        agentBusy={running}
                        onStepChange={onGoToStep}
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
