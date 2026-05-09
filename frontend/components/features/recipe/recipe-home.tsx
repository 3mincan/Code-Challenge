"use client"

import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"

import { UploadExperience } from "@/components/features/upload/upload-experience"
import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Container, Section } from "@/components/ui/section"
import { Surface } from "@/components/ui/surface"
import { Text } from "@/components/ui/typography"
import { useRecipeCoAgent } from "@/hooks/use-recipe-coagent"

function RecipeExperienceLoading() {
  return (
    <AppShell>
      <ShellMain>
        <Section spacing="lg" className="min-h-screen bg-surface-soft">
          <Container>
            <div
              className="mx-auto max-w-2xl space-y-5 py-10"
              aria-busy="true"
              aria-live="polite"
              aria-label="Loading cooking workspace"
            >
              <div className="h-3 w-40 animate-pulse rounded-full bg-hairline-soft" />
              <div className="h-48 rounded-xl border border-hairline bg-canvas shadow-elevation-1" />
              <div className="h-3 w-full animate-pulse rounded-full bg-hairline-soft" />
              <div className="h-3 max-w-[83%] animate-pulse rounded-full bg-hairline-soft" />
            </div>
          </Container>
        </Section>
      </ShellMain>
    </AppShell>
  )
}

const RecipeExperience = dynamic(
  () =>
    import("@/components/features/recipe/recipe-experience").then((m) => ({
      default: m.RecipeExperience,
    })),
  { loading: RecipeExperienceLoading }
)

function RecipeHome() {
  const {
    incompleteSession,
    isHydrating,
    originalState,
    running,
    state,
    threadId,
    toggleIngredient,
    goToStep,
  } = useRecipeCoAgent()

  if (isHydrating) {
    return (
      <AppShell>
        <ShellMain>
          <Section spacing="hero">
            <Container>
              <Surface
                variant="base"
                className="mx-auto max-w-2xl space-y-4 p-8"
                aria-busy="true"
                aria-live="polite"
                aria-label="Loading recipe workspace"
              >
                <Text variant="caption" measure="none">
                  Preparing kitchen
                </Text>
                <div className="h-4 w-8/12 rounded-full bg-hairline-soft" />
                <div className="h-4 w-6/12 rounded-full bg-hairline-soft" />
              </Surface>
            </Container>
          </Section>
        </ShellMain>
      </AppShell>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.recipe ? (
        <motion.div
          key="recipe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <RecipeExperience
            originalState={originalState}
            running={running}
            state={state}
            threadId={threadId}
            onToggleIngredient={toggleIngredient}
            onGoToStep={goToStep}
          />
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <UploadExperience incompleteSession={incompleteSession} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { RecipeHome }
