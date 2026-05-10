import type { RecipeContext, UploadRecipeResponse } from "@/types/recipe"

const STORE_KEY = "recipe-companion.store.v2"
const THREAD_ID_KEY = "recipe-companion.thread-id"
const STATE_KEY = "recipe-companion.initial-state"
const ORIGINAL_STATE_KEY = "recipe-companion.original-state"
const SESSION_CHANGED_EVENT = "recipe-companion:session-changed"

let didMigrateSessionToLocal = false

function ensureMigratedFromSessionStorage() {
  if (typeof window === "undefined" || didMigrateSessionToLocal) {
    return
  }
  didMigrateSessionToLocal = true

  if (!window.localStorage.getItem(STORE_KEY)) {
    const bundled = window.sessionStorage.getItem(STORE_KEY)
    if (bundled) {
      window.localStorage.setItem(STORE_KEY, bundled)
      window.sessionStorage.removeItem(STORE_KEY)
    }
  }

  for (const key of [THREAD_ID_KEY, STATE_KEY, ORIGINAL_STATE_KEY]) {
    if (!window.localStorage.getItem(key)) {
      const value = window.sessionStorage.getItem(key)
      if (value) {
        window.localStorage.setItem(key, value)
        window.sessionStorage.removeItem(key)
      }
    }
  }
}

function storageGet(key: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  ensureMigratedFromSessionStorage()
  return window.localStorage.getItem(key)
}

function storageSet(key: string, value: string) {
  if (typeof window === "undefined") {
    return
  }
  ensureMigratedFromSessionStorage()
  window.localStorage.setItem(key, value)
}

function storageRemove(key: string) {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(key)
}

type RecipeRecord = {
  threadId: string
  upload: UploadRecipeResponse
  state: RecipeContext
  originalState: RecipeContext
  createdAt: string
  updatedAt: string
}

type RecipeStoreV2 = {
  v: 2
  activeRecipeId: string | null
  recipes: Record<string, RecipeRecord>
}

type StoredRecipeSession = {
  threadId: string
  state: RecipeContext
}

type StoreRecipeSessionOptions = {
  notify?: boolean
}

function dispatchSessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
  }
}

function readRawJson(key: string): string | null {
  return storageGet(key)
}

function parseStore(raw: string | null): RecipeStoreV2 | null {
  if (!raw) {
    return null
  }
  try {
    const data = JSON.parse(raw) as RecipeStoreV2
    if (data?.v === 2 && data.recipes && typeof data.recipes === "object") {
      return data
    }
  } catch {
    return null
  }
  return null
}

function writeStore(store: RecipeStoreV2) {
  if (typeof window === "undefined") {
    return
  }
  ensureMigratedFromSessionStorage()
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function readLegacyStoredState(key: string): RecipeContext | null {
  const raw = readRawJson(key)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as RecipeContext
  } catch {
    return null
  }
}

function migrateLegacyToV2(): RecipeStoreV2 | null {
  const threadId = readRawJson(THREAD_ID_KEY)
  const state = readLegacyStoredState(STATE_KEY)
  if (!threadId || !state) {
    return null
  }

  const original =
    readLegacyStoredState(ORIGINAL_STATE_KEY) ?? structuredClone(state)
  const runId = crypto.randomUUID()
  const upload: UploadRecipeResponse = {
    threadId,
    runId,
    state,
    tools: [],
    context: [],
    forwardedProps: {},
    messages: [],
  }
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const record: RecipeRecord = {
    threadId,
    upload,
    state,
    originalState: structuredClone(original),
    createdAt: now,
    updatedAt: now,
  }

  const store: RecipeStoreV2 = {
    v: 2,
    activeRecipeId: id,
    recipes: { [id]: record },
  }
  writeStore(store)
  syncLegacyFlatKeys(record)
  return store
}

function readStore(): RecipeStoreV2 | null {
  if (typeof window === "undefined") {
    return null
  }
  const parsed = parseStore(readRawJson(STORE_KEY))
  if (parsed) {
    return parsed
  }
  return migrateLegacyToV2()
}

function syncLegacyFlatKeys(record: RecipeRecord) {
  storageSet(THREAD_ID_KEY, record.threadId)
  storageSet(STATE_KEY, JSON.stringify(record.state))
  storageSet(ORIGINAL_STATE_KEY, JSON.stringify(record.originalState))
}

function clearFlatLegacyKeys() {
  storageRemove(THREAD_ID_KEY)
  storageRemove(STATE_KEY)
  storageRemove(ORIGINAL_STATE_KEY)
}

/**
 * Persist full POST /upload JSON plus client recipe id. Returns the id for
 * `/recipe/[id]`.
 */
function registerRecipeUpload(response: UploadRecipeResponse): string {
  const store = readStore() ?? { v: 2, activeRecipeId: null, recipes: {} }
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const originalState = structuredClone(response.state)

  const record: RecipeRecord = {
    threadId: response.threadId,
    upload: response,
    state: response.state,
    originalState,
    createdAt: now,
    updatedAt: now,
  }
  store.recipes[id] = record
  store.activeRecipeId = id
  writeStore(store)
  syncLegacyFlatKeys(record)
  dispatchSessionChanged()
  return id
}

function readRecipeRecord(recipeId: string): RecipeRecord | null {
  const store = readStore()
  if (!store) {
    return null
  }
  return store.recipes[recipeId] ?? null
}

function recipeRecordExists(recipeId: string): boolean {
  return readRecipeRecord(recipeId) !== null
}

function setActiveRecipeId(recipeId: string): boolean {
  const store = readStore()
  if (!store || !store.recipes[recipeId]) {
    return false
  }
  store.activeRecipeId = recipeId
  writeStore(store)
  syncLegacyFlatKeys(store.recipes[recipeId]!)
  dispatchSessionChanged()
  return true
}

/** True when any saved thread has no recipe payload (interrupt / stale agent). */
function hasIncompletePersistedSession(): boolean {
  const store = readStore()
  if (!store) {
    return false
  }
  return Object.values(store.recipes).some(
    (r) => Boolean(r.threadId) && !r.state.recipe
  )
}

function storeRecipeSession(
  session: StoredRecipeSession,
  { notify = true }: StoreRecipeSessionOptions = {}
) {
  const store = readStore()
  if (!store?.activeRecipeId) {
    if (typeof window !== "undefined") {
      storageSet(THREAD_ID_KEY, session.threadId)
      storageSet(STATE_KEY, JSON.stringify(session.state))
      if (!storageGet(ORIGINAL_STATE_KEY)) {
        storageSet(ORIGINAL_STATE_KEY, JSON.stringify(session.state))
      }
    }
    if (notify) {
      dispatchSessionChanged()
    }
    return
  }

  const id = store.activeRecipeId
  const record = store.recipes[id]
  if (!record) {
    return
  }

  record.state = session.state
  record.updatedAt = new Date().toISOString()
  store.recipes[id] = record
  writeStore(store)
  syncLegacyFlatKeys(record)

  if (notify) {
    dispatchSessionChanged()
  }
}

function readRecipeSession(): StoredRecipeSession | null {
  const store = readStore()
  if (!store?.activeRecipeId) {
    return null
  }
  const r = store.recipes[store.activeRecipeId]
  if (!r) {
    return null
  }
  return { threadId: r.threadId, state: r.state }
}

function readOriginalRecipeContext(): RecipeContext | null {
  const store = readStore()
  if (!store?.activeRecipeId) {
    return readLegacyStoredState(ORIGINAL_STATE_KEY)
  }
  return store.recipes[store.activeRecipeId]?.originalState ?? null
}

/**
 * Drop stored recipes that never received a parsed `recipe` (stale agent).
 * Complete recipes are kept so `/recipe/[id]` links keep working.
 */
function pruneIncompleteRecipeRecords() {
  const store = readStore()
  if (!store) {
    return
  }

  const nextRecipes: Record<string, RecipeRecord> = {}
  for (const [id, record] of Object.entries(store.recipes)) {
    const incomplete = Boolean(record.threadId) && !record.state.recipe
    if (!incomplete) {
      nextRecipes[id] = record
    }
  }

  let activeRecipeId = store.activeRecipeId
  if (activeRecipeId && !nextRecipes[activeRecipeId]) {
    activeRecipeId = null
  }

  if (!activeRecipeId) {
    const sorted = Object.entries(nextRecipes).sort((a, b) =>
      b[1].updatedAt.localeCompare(a[1].updatedAt)
    )
    activeRecipeId = sorted[0]?.[0] ?? null
  }

  const nextStore: RecipeStoreV2 = {
    v: 2,
    activeRecipeId,
    recipes: nextRecipes,
  }
  writeStore(nextStore)

  if (activeRecipeId && nextRecipes[activeRecipeId]) {
    syncLegacyFlatKeys(nextRecipes[activeRecipeId]!)
  } else {
    clearFlatLegacyKeys()
  }

  dispatchSessionChanged()
}

function subscribeToRecipeSession(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === STORE_KEY ||
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

function getThreadIdForRecipePath(pathname: string | null): string | undefined {
  if (typeof window === "undefined" || !pathname) {
    return undefined
  }
  const match = pathname.match(/^\/recipe\/([^/]+)\/?$/)
  if (!match?.[1]) {
    return undefined
  }
  const record = readRecipeRecord(match[1])
  return record?.threadId
}

type SavedRecipeSummary = {
  id: string
  title: string
  updatedAt: string
}

const EMPTY_SAVED_SUMMARIES: SavedRecipeSummary[] = []

let savedSummariesCacheKey = ""
let savedSummariesSnapshot: SavedRecipeSummary[] = EMPTY_SAVED_SUMMARIES

function listSavedRecipeSummaries(): SavedRecipeSummary[] {
  const store = readStore()
  if (!store) {
    return []
  }

  return Object.entries(store.recipes)
    .filter(([, record]) => record.state.recipe != null)
    .map(([id, record]) => ({
      id,
      title: record.state.recipe?.title ?? "Recipe",
      updatedAt: record.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/**
 * Stable reference for `useSyncExternalStore` — React compares snapshots with
 * `Object.is`; a fresh array from `listSavedRecipeSummaries()` every tick
 * triggers infinite re-renders.
 */
function getSavedRecipeSummariesSnapshot(): SavedRecipeSummary[] {
  if (typeof window === "undefined") {
    return EMPTY_SAVED_SUMMARIES
  }
  const list = listSavedRecipeSummaries()
  const key =
    list.length === 0
      ? ""
      : list.map((s) => `${s.id}:${s.updatedAt}:${s.title}`).join("\n")

  if (key === savedSummariesCacheKey) {
    return savedSummariesSnapshot
  }

  savedSummariesCacheKey = key
  savedSummariesSnapshot =
    list.length === 0 ? EMPTY_SAVED_SUMMARIES : list
  return savedSummariesSnapshot
}

function getSavedRecipeSummariesServerSnapshot(): SavedRecipeSummary[] {
  return EMPTY_SAVED_SUMMARIES
}

export {
  getSavedRecipeSummariesServerSnapshot,
  getSavedRecipeSummariesSnapshot,
  getThreadIdForRecipePath,
  hasIncompletePersistedSession,
  listSavedRecipeSummaries,
  pruneIncompleteRecipeRecords,
  readOriginalRecipeContext,
  readRecipeRecord,
  readRecipeSession,
  recipeRecordExists,
  registerRecipeUpload,
  setActiveRecipeId,
  storeRecipeSession,
  subscribeToRecipeSession,
}
export type {
  RecipeRecord,
  SavedRecipeSummary,
  StoreRecipeSessionOptions,
  StoredRecipeSession,
}
