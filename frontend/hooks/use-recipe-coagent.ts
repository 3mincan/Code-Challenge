"use client"

import { useCoAgent } from "@copilotkit/react-core"
import { useAgent } from "@copilotkit/react-core/v2"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { RECIPE_AGENT_NAME } from "@/config/copilot"
import { emptyRecipeContext } from "@/lib/recipe-context"
import {
  clearCopilotRunError,
  getCopilotRunErrorSnapshot,
  publishCopilotRunError,
  subscribeCopilotRunError,
} from "@/lib/copilot-run-error-store"
import { getUserFacingMessage } from "@/lib/errors/user-message"
import {
  readRecipeRecord,
  readRecipeSession,
  setActiveRecipeId,
  storeRecipeSession,
} from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

type RecipeCoAgentStatus = "missing-session" | "ready"

function initialStateForRecipe(recipeId: string): RecipeContext {
  if (typeof window === "undefined") {
    return emptyRecipeContext
  }
  return readRecipeRecord(recipeId)?.state ?? emptyRecipeContext
}

function initialThreadForRecipe(recipeId: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  return readRecipeRecord(recipeId)?.threadId ?? null
}

function initialOriginalForRecipe(recipeId: string): RecipeContext | null {
  if (typeof window === "undefined") {
    return null
  }
  return readRecipeRecord(recipeId)?.originalState ?? null
}

/**
 * Co-agent state for `/recipe/[id]`. Remount this hook when `recipeId`
 * changes (parent should pass `key={recipeId}`).
 */
function useRecipeCoAgent(recipeId: string) {
  useLayoutEffect(() => {
    setActiveRecipeId(recipeId)
    clearCopilotRunError()
  }, [recipeId])

  const { agent } = useAgent({ agentId: RECIPE_AGENT_NAME })

  useEffect(() => {
    if (!agent) {
      return
    }

    const { unsubscribe } = agent.subscribe({
      onRunFailed: ({ error }) => {
        publishCopilotRunError(getUserFacingMessage(error))
      },
      onRunErrorEvent: ({ event }) => {
        publishCopilotRunError(getUserFacingMessage(event))
      },
    })

    return () => {
      unsubscribe()
    }
  }, [agent])

  const copilotRunError = useSyncExternalStore(
    subscribeCopilotRunError,
    getCopilotRunErrorSnapshot,
    () => null
  )

  const [originalState] = useState<RecipeContext | null>(() =>
    initialOriginalForRecipe(recipeId)
  )
  const [bootstrapThreadId] = useState<string | null>(() =>
    initialThreadForRecipe(recipeId)
  )
  /** One snapshot per mount — do not mirror agent state in React `useState`. */
  const [initialAgentState] = useState<RecipeContext>(() =>
    initialStateForRecipe(recipeId)
  )

  const coagent = useCoAgent<RecipeContext>({
    name: RECIPE_AGENT_NAME,
    initialState: initialAgentState,
  })

  const syncedThreadId = coagent.threadId ?? bootstrapThreadId

  /** Agent connect can clear state before AG-UI re-hydrates; keep upload snapshot until agent carries a recipe. */
  const state = useMemo((): RecipeContext => {
    const agentState = coagent.state as RecipeContext | undefined
    if (agentState?.recipe != null) {
      return agentState
    }
    if (initialAgentState.recipe != null) {
      return initialAgentState
    }
    return agentState ?? emptyRecipeContext
  }, [coagent.state, initialAgentState])

  const resolveCoAgentBase = useCallback((): RecipeContext => {
    const agentState = coagent.state as RecipeContext | undefined
    if (agentState?.recipe != null) {
      return agentState
    }
    if (initialAgentState.recipe != null) {
      return initialAgentState
    }
    return agentState ?? emptyRecipeContext
  }, [coagent.state, initialAgentState])

  const hydratedForThreadRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (!syncedThreadId || !initialAgentState.recipe) {
      return
    }
    if (hydratedForThreadRef.current === syncedThreadId) {
      return
    }
    hydratedForThreadRef.current = syncedThreadId
    coagent.setState((prev) => {
      const p = prev as RecipeContext | undefined
      if (p?.recipe != null) {
        return p
      }
      return initialAgentState
    })
  }, [coagent, coagent.setState, initialAgentState, syncedThreadId])

  useEffect(() => {
    if (!syncedThreadId || !state.recipe) {
      return
    }

    const pending = state
    const id = window.setTimeout(() => {
      storeRecipeSession(
        {
          threadId: syncedThreadId,
          state: pending,
        },
        { notify: false }
      )
    }, 200)

    return () => window.clearTimeout(id)
  }, [state, syncedThreadId])

  const status: RecipeCoAgentStatus = syncedThreadId
    ? "ready"
    : "missing-session"

  const incompleteSession = useMemo(() => {
    if (status !== "ready" || !syncedThreadId) {
      return false
    }
    if (state.recipe) {
      return false
    }
    const persisted = readRecipeSession()
    return Boolean(
      persisted?.threadId &&
        persisted.threadId === syncedThreadId &&
        !persisted.state.recipe
    )
  }, [state.recipe, status, syncedThreadId])

  const toggleIngredient = useCallback(
    (ingredientName: string) => {
      coagent.setState((previousState) => {
        const currentState =
          previousState?.recipe != null
            ? previousState
            : resolveCoAgentBase()
        const existingChecked = currentState.checked_ingredients ?? []
        const checkedIngredients = new Set(
          existingChecked.map((item) => item.toLowerCase())
        )
        const normalisedName = ingredientName.toLowerCase()
        const nextCheckedIngredients = checkedIngredients.has(normalisedName)
          ? existingChecked.filter(
              (item) => item.toLowerCase() !== normalisedName
            )
          : [...existingChecked, ingredientName]

        return {
          ...currentState,
          checked_ingredients: nextCheckedIngredients,
        }
      })
    },
    [coagent, resolveCoAgentBase]
  )

  const goToStep = useCallback(
    (stepIndex: number) => {
      coagent.setState((previousState) => {
        const currentState =
          previousState?.recipe != null
            ? previousState
            : resolveCoAgentBase()
        const stepCount = currentState.recipe?.steps.length ?? 0

        if (!stepCount) {
          return currentState
        }

        const clamped = Math.min(Math.max(0, stepIndex), stepCount - 1)

        return {
          ...currentState,
          current_step: clamped,
          cooking_started: true,
        }
      })
    },
    [coagent, resolveCoAgentBase]
  )

  const dismissCopilotRunError = useCallback(() => {
    clearCopilotRunError()
  }, [])

  return useMemo(
    () => ({
      copilotRunError,
      dismissCopilotRunError,
      error:
        status === "missing-session"
          ? "Upload a recipe before starting the cooking workspace."
          : null,
      incompleteSession,
      isHydrating: false,
      isReady: status === "ready",
      originalState,
      running: coagent.running,
      goToStep,
      setState: coagent.setState,
      start: coagent.start,
      state,
      status,
      stop: coagent.stop,
      threadId: syncedThreadId ?? null,
      toggleIngredient,
    }),
    [
      copilotRunError,
      coagent.running,
      dismissCopilotRunError,
      goToStep,
      coagent.setState,
      coagent.start,
      state,
      coagent.stop,
      incompleteSession,
      originalState,
      status,
      syncedThreadId,
      toggleIngredient,
    ]
  )
}

export { useRecipeCoAgent }
