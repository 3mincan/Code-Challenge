"use client"

import { AnimatePresence, motion } from "framer-motion"

import { UploadExperience } from "@/components/features/upload/upload-experience"
import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Container, Section } from "@/components/ui/section"
import { Surface } from "@/components/ui/surface"
import { Text } from "@/components/ui/typography"
import { useRecipeCoAgent } from "@/hooks/use-recipe-coagent"

import { RecipeExperience } from "./recipe-experience"

function RecipeHome() {
  const {
    isHydrating,
    originalState,
    running,
    state,
    threadId,
    toggleIngredient,
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
    <AnimatePresence mode="wait">
      {state.recipe ? (
        <motion.div
          key="recipe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <RecipeExperience
            originalState={originalState}
            running={running}
            state={state}
            threadId={threadId}
            onToggleIngredient={toggleIngredient}
          />
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <UploadExperience />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { RecipeHome }
