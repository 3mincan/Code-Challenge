"use client"

import { useCoAgent } from "@copilotkit/react-core"
import { useEffect, useMemo, useState } from "react"

import { RECIPE_AGENT_NAME } from "@/config/copilot"
import { emptyRecipeContext } from "@/lib/recipe-context"
import {
  readRecipeSession,
  storeRecipeSession,
  subscribeToRecipeSession,
} from "@/lib/recipe-session"
import type { RecipeContext } from "@/types/recipe"

type RecipeCoAgentStatus = "hydrating" | "missing-session" | "ready"

function useRecipeCoAgent() {
  const [hydrated, setHydrated] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [state, setState] = useState<RecipeContext>(emptyRecipeContext)

  useEffect(() => {
    const refreshSession = () => {
      const session = readRecipeSession()
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

  return useMemo(
    () => ({
      error:
        status === "missing-session"
          ? "Upload a recipe before starting the cooking workspace."
          : null,
      isHydrating: status === "hydrating",
      isReady: status === "ready",
      running: coagent.running,
      start: coagent.start,
      state: coagent.state,
      status,
      stop: coagent.stop,
      threadId: syncedThreadId ?? null,
    }),
    [
      coagent.running,
      coagent.start,
      coagent.state,
      coagent.stop,
      status,
      syncedThreadId,
    ]
  )
}

export { useRecipeCoAgent }
export type { RecipeCoAgentStatus }
