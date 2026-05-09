import type { RecipeContext } from "@/types/recipe"

const THREAD_ID_KEY = "recipe-companion.thread-id"
const STATE_KEY = "recipe-companion.initial-state"

type StoredRecipeSession = {
  threadId: string
  state: RecipeContext
}

function storeRecipeSession(session: StoredRecipeSession) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(THREAD_ID_KEY, session.threadId)
  window.sessionStorage.setItem(STATE_KEY, JSON.stringify(session.state))
}

function readRecipeSession(): StoredRecipeSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const threadId = window.sessionStorage.getItem(THREAD_ID_KEY)
  const rawState = window.sessionStorage.getItem(STATE_KEY)

  if (!threadId || !rawState) {
    return null
  }

  try {
    return { threadId, state: JSON.parse(rawState) as RecipeContext }
  } catch {
    return null
  }
}

export { readRecipeSession, storeRecipeSession }
export type { StoredRecipeSession }
