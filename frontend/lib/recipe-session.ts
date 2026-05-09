import type { RecipeContext } from "@/types/recipe"

const THREAD_ID_KEY = "recipe-companion.thread-id"
const STATE_KEY = "recipe-companion.initial-state"
const ORIGINAL_STATE_KEY = "recipe-companion.original-state"
const SESSION_CHANGED_EVENT = "recipe-companion:session-changed"

type StoredRecipeSession = {
  threadId: string
  state: RecipeContext
}

type StoreRecipeSessionOptions = {
  notify?: boolean
}

function storeRecipeSession(
  session: StoredRecipeSession,
  { notify = true }: StoreRecipeSessionOptions = {}
) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(THREAD_ID_KEY, session.threadId)
  window.sessionStorage.setItem(STATE_KEY, JSON.stringify(session.state))
  if (!window.sessionStorage.getItem(ORIGINAL_STATE_KEY)) {
    window.sessionStorage.setItem(
      ORIGINAL_STATE_KEY,
      JSON.stringify(session.state)
    )
  }
  if (notify) {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
  }
}

function readStoredState(key: string) {
  const rawState = window.sessionStorage.getItem(key)

  if (!rawState) {
    return null
  }

  try {
    return JSON.parse(rawState) as RecipeContext
  } catch {
    return null
  }
}

function readRecipeSession(): StoredRecipeSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const threadId = window.sessionStorage.getItem(THREAD_ID_KEY)
  const state = readStoredState(STATE_KEY)

  if (!threadId || !state) {
    return null
  }

  return { threadId, state }
}

function readOriginalRecipeContext() {
  if (typeof window === "undefined") {
    return null
  }

  return readStoredState(ORIGINAL_STATE_KEY)
}

function clearRecipeSession() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(THREAD_ID_KEY)
  window.sessionStorage.removeItem(STATE_KEY)
  window.sessionStorage.removeItem(ORIGINAL_STATE_KEY)
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

function subscribeToRecipeSession(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === THREAD_ID_KEY ||
      event.key === STATE_KEY ||
      event.key === ORIGINAL_STATE_KEY
    ) {
      listener()
    }
  }

  window.addEventListener(SESSION_CHANGED_EVENT, listener)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, listener)
    window.removeEventListener("storage", handleStorage)
  }
}

export {
  clearRecipeSession,
  readOriginalRecipeContext,
  readRecipeSession,
  storeRecipeSession,
  subscribeToRecipeSession,
}
export type { StoreRecipeSessionOptions, StoredRecipeSession }
