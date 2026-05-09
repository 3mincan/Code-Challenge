"use client"

import { useCoAgent } from "@copilotkit/react-core"
import { useCallback, useEffect, useMemo, useState } from "react"

import { RECIPE_AGENT_NAME } from "@/config/copilot"
import { emptyRecipeContext } from "@/lib/recipe-context"
import {
  readRecipeSession,
  readOriginalRecipeContext,
  storeRecipeSession,
  subscribeToRecipeSession,
} from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

type RecipeCoAgentStatus = "hydrating" | "missing-session" | "ready"

/**
 * Single source of truth: `useCoAgent` state matches the backend RecipeContext
 * (via AG-UI). Local `setState` is used only for pure-UI fields (e.g. checked
 * ingredients) or forwarding CopilotKit merges — recipe rows, servings, steps,
 * and progress always reflect `coagent.state`.
 */
function useRecipeCoAgent() {
  const [hydrated, setHydrated] = useState(false)
  const [originalState, setOriginalState] = useState<RecipeContext | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [state, setState] = useState<RecipeContext>(emptyRecipeContext)

  useEffect(() => {
    const refreshSession = () => {
      const session = readRecipeSession()
      setOriginalState(readOriginalRecipeContext())
      setThreadId(session?.threadId ?? null)
      setState(session?.state ?? emptyRecipeContext)
      setHydrated(true)
    }

    refreshSession()
    return subscribeToRecipeSession(refreshSession)
  }, [])

  const coagent = useCoAgent<RecipeContext>({
    name: RECIPE_AGENT_NAME,
    state,
    setState,
  })

  const syncedThreadId = coagent.threadId ?? threadId

  useEffect(() => {
    if (!hydrated || !syncedThreadId || !coagent.state.recipe) {
      return
    }

    storeRecipeSession(
      {
        threadId: syncedThreadId,
        state: coagent.state,
      },
      { notify: false }
    )
  }, [coagent.state, hydrated, syncedThreadId])

  const status: RecipeCoAgentStatus = !hydrated
    ? "hydrating"
    : syncedThreadId
      ? "ready"
      : "missing-session"

  const toggleIngredient = useCallback(
    (ingredientName: string) => {
      coagent.setState((previousState) => {
        const currentState = previousState ?? emptyRecipeContext
        const checkedIngredients = new Set(
          currentState.checked_ingredients.map((item) => item.toLowerCase())
        )
        const normalisedName = ingredientName.toLowerCase()
        const nextCheckedIngredients = checkedIngredients.has(normalisedName)
          ? currentState.checked_ingredients.filter(
              (item) => item.toLowerCase() !== normalisedName
            )
          : [...currentState.checked_ingredients, ingredientName]

        return {
          ...currentState,
          checked_ingredients: nextCheckedIngredients,
        }
      })
    },
    [coagent]
  )

  return useMemo(
    () => ({
      error:
        status === "missing-session"
          ? "Upload a recipe before starting the cooking workspace."
          : null,
      isHydrating: status === "hydrating",
      isReady: status === "ready",
      originalState,
      running: coagent.running,
      setState: coagent.setState,
      start: coagent.start,
      state: coagent.state,
      status,
      stop: coagent.stop,
      threadId: syncedThreadId ?? null,
      toggleIngredient,
    }),
    [
      coagent.running,
      coagent.setState,
      coagent.start,
      coagent.state,
      coagent.stop,
      originalState,
      status,
      syncedThreadId,
      toggleIngredient,
    ]
  )
}

export { useRecipeCoAgent }
export type { RecipeCoAgentStatus }
