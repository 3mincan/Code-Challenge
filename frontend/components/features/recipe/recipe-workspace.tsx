"use client"

import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"
import { useRecipeCoAgent } from "@/hooks/use-recipe-coagent"
import {
  recipeRecordExists,
  subscribeToRecipeSession,
} from "@/lib/recipe-session"

import { RecipeExperience } from "./recipe-experience"

type RecipeWorkspaceProps = {
  recipeId: string
}

function RecipeWorkspace({ recipeId }: RecipeWorkspaceProps) {
  const router = useRouter()
  const exists = useSyncExternalStore(
    subscribeToRecipeSession,
    () => recipeRecordExists(recipeId),
    () => false
  )

  if (!exists) {
    return (
      <AppShell>
        <ShellMain>
          <Section spacing="hero">
            <Container className="max-w-xl space-y-4">
              <Text variant="h3" measure="none">
                Recipe not found
              </Text>
              <Text tone="muted" measure="none">
                This recipe id is not in this browser&apos;s saved data.
                Uploads are stored locally on this device; another browser,
                private mode, or cleared site data will not have it.
              </Text>
              <Button
                type="button"
                variant="default"
                onClick={() => router.push("/")}
              >
                Upload a recipe
              </Button>
            </Container>
          </Section>
        </ShellMain>
      </AppShell>
    )
  }

  return <RecipeWorkspaceLoaded key={recipeId} recipeId={recipeId} />
}

function RecipeWorkspaceLoaded({ recipeId }: { recipeId: string }) {
  const {
    copilotRunError,
    dismissCopilotRunError,
    error,
    incompleteSession,
    originalState,
    running,
    state,
    threadId,
    goToStep,
    toggleIngredient,
  } = useRecipeCoAgent(recipeId)

  if (!state.recipe) {
    return (
      <AppShell>
        <ShellMain>
          <Section spacing="hero">
            <Container>
              <div
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
              </div>
            </Container>
          </Section>
        </ShellMain>
      </AppShell>
    )
  }

  return (
    <>
      {incompleteSession ? (
        <div className="border-b border-hairline-soft bg-tint-peach/40 px-4 py-3">
          <Container>
            <Text variant="small" measure="none">
              Saved session may be out of sync. If the workspace looks wrong,
              start fresh from the home page.
            </Text>
          </Container>
        </div>
      ) : null}
      {error ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-3">
          <Container>
            <Text variant="small-medium" measure="none">
              {error}
            </Text>
          </Container>
        </div>
      ) : null}
      {copilotRunError ? (
        <div
          className="border-b border-destructive/25 bg-destructive/10 px-4 py-3"
          role="alert"
        >
          <Container className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <Text variant="small-medium" measure="none" className="min-w-0">
              {copilotRunError}
            </Text>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start touch-manipulation"
              onClick={() => dismissCopilotRunError()}
            >
              Dismiss
            </Button>
          </Container>
        </div>
      ) : null}
      <RecipeExperience
        originalState={originalState}
        running={running}
        state={state}
        threadId={threadId}
        onToggleIngredient={toggleIngredient}
        onGoToStep={goToStep}
      />
    </>
  )
}

export { RecipeWorkspace }
