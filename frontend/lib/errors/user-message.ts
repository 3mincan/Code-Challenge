import { ApiError } from "@/lib/api/api-error"

type ErrorKind = "client" | "network" | "timeout" | "server" | "unknown"

/** FastAPI / Starlette style: `detail` string, or list of validation objects. */
function parseFastApiDetail(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null
  }

  const record = body as Record<string, unknown>
  const detail = record.detail

  if (typeof detail === "string") {
    return normaliseTechnicalPhrases(detail)
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null
        }
        const row = item as Record<string, unknown>
        if (typeof row.msg === "string") {
          return row.msg
        }
        return null
      })
      .filter((item): item is string => Boolean(item))

    if (messages.length > 0) {
      return normaliseTechnicalPhrases(messages.join(" "))
    }
  }

  return null
}

/** CopilotKit / AG-UI often throw plain `Error` with long provider payloads in `.message`. */
function mapLlmProviderFaultToUserMessage(text: string): string | null {
  const t = text.trim()
  if (!t) {
    return null
  }

  if (
    /status_code:\s*429|\b429\b.*quota|RESOURCE_EXHAUSTED|quota exceeded|rate limit|free_tier|free tier|generate_content_free_tier|generativelanguage\.googleapis\.com|insufficient[_\s]quota|too many requests/i.test(
      t
    )
  ) {
    return "Chef could not reply: the AI provider quota or rate limit was reached. Wait a short while and try again, or check billing and model settings for your API key."
  }

  if (/status_code:\s*5\d\d|\b503\b|\b502\b|\b504\b|overloaded|unavailable/i.test(t)) {
    return "Chef could not reply: the AI service is overloaded or unavailable. Try again in a moment."
  }

  if (/invalid.*api[_\s]?key|API key not valid|401\b|403\b.*permission/i.test(t)) {
    return "Chef could not reply: the AI API key appears invalid or unauthorised. Check your backend configuration."
  }

  /** Wrong origin/path: server proxied to Next.js instead of FastAPI (expects …/copilotkit on Python). */
  if (
    /<!DOCTYPE\s+html|<title>\s*404:?\s*This page could not be found/i.test(t) ||
    /_next\/static\/chunks|next-error-h1|"payload":\s*'<!DOCTYPE/i.test(t)
  ) {
    return (
      "Chef could not reach the Python backend: the response was a Next.js HTML page (often 404). " +
      "Check production env: NEXT_PUBLIC_API_BASE_URL and API_INTERNAL_BASE_URL must be the FastAPI origin " +
      "(with /upload and /copilotkit), not the Next.js site URL. Inside Docker, API_INTERNAL_BASE_URL " +
      "should use the backend service hostname (for example http://backend:8000)."
    )
  }

  return null
}

function diagnosticStringFromUnknown(value: unknown, maxLen = 6000): string {
  if (value instanceof Error) {
    return value.message.slice(0, maxLen)
  }
  if (typeof value === "string") {
    return value.slice(0, maxLen)
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>
    if (typeof o.message === "string") {
      return o.message.slice(0, maxLen)
    }
    if (typeof o.error === "string") {
      return o.error.slice(0, maxLen)
    }
    if (o.error instanceof Error) {
      return o.error.message.slice(0, maxLen)
    }
    try {
      const s = JSON.stringify(value)
      return (s.length > maxLen ? `${s.slice(0, maxLen)}…` : s).trim()
    } catch {
      return String(value).slice(0, maxLen)
    }
  }
  return String(value ?? "").slice(0, maxLen)
}

/** Turn occasional backend phrases into calmer copy without dumping internals. */
function normaliseTechnicalPhrases(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) {
    return ""
  }
  if (/connection refused|econnrefused|networkError|Failed to fetch/i.test(trimmed)) {
    return "We could not reach the recipe service. Check that it is running, then try again."
  }
  return trimmed
}

function getStatusFallbackMessage(status: number): string | null {
  if (status === 400) {
    return "That file could not be read as a recipe. Try a PDF or a text file with ingredients and steps."
  }
  if (status === 413) {
    return "That file is too large for this upload. Try a smaller file or paste the recipe into a text file."
  }
  if (status === 429) {
    return "Too many requests right now. Wait a moment and try again."
  }
  if (status === 401 || status === 403) {
    return "Access was denied. If you are using an API key, check your setup."
  }
  if (status === 404) {
    return "The recipe service could not find what it needed. Check the API address in your settings."
  }
  if (status >= 500 && status < 600) {
    if (status === 502 || status === 503 || status === 504) {
      return "The recipe service is temporarily unavailable. Try again shortly."
    }
    return "The recipe service hit a problem. Wait a moment and try again."
  }
  return null
}

function looksLikeNextHtml404(body: unknown): boolean {
  if (typeof body !== "string") {
    return false
  }
  const s = body.slice(0, 4000)
  return (
    /<!DOCTYPE\s+html/i.test(s) &&
    (/_next\/static|next-error-h1|This page could not be found/i.test(s) ||
      /<title>\s*404/i.test(s))
  )
}

function getUserFacingApiMessage(status: number, body: unknown): string {
  const fromBody = parseFastApiDetail(body)
  if (fromBody) {
    return fromBody
  }

  if (looksLikeNextHtml404(body)) {
    return (
      "The upload URL returned a web page instead of the Python API. " +
      "Set NEXT_PUBLIC_API_BASE_URL to your FastAPI origin (where /upload exists), not your Next.js URL."
    )
  }

  return (
    getStatusFallbackMessage(status) ??
    "Something went wrong talking to the recipe service."
  )
}

function classifyError(error: unknown): ErrorKind {
  if (error instanceof ApiError) {
    if (error.status === 408 || /timeout/i.test(error.message)) {
      return "timeout"
    }
    if (error.status >= 500 || error.status === 502 || error.status === 503) {
      return "server"
    }
    if (error.status >= 400 && error.status < 500) {
      return "client"
    }
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "network"
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes("timeout") || msg.includes("too long")) {
      return "timeout"
    }
    if (
      msg.includes("could not reach") ||
      msg.includes("network") ||
      msg.includes("failed to fetch")
    ) {
      return "network"
    }
  }

  return "unknown"
}

function getUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return getUserFacingApiMessage(error.status, error.body)
  }

  const diagnostic = diagnosticStringFromUnknown(error)
  const fromLlm = mapLlmProviderFaultToUserMessage(diagnostic)
  if (fromLlm) {
    return fromLlm
  }

  if (error instanceof Error) {
    const cleaned = normaliseTechnicalPhrases(error.message)
    if (cleaned) {
      return cleaned
    }
  }

  return "Something unexpected happened. You can try again in a moment."
}

export {
  classifyError,
  diagnosticStringFromUnknown,
  getUserFacingApiMessage,
  getUserFacingMessage,
  getStatusFallbackMessage,
  mapLlmProviderFaultToUserMessage,
  parseFastApiDetail,
}
export type { ErrorKind }
