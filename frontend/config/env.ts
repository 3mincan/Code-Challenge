const DEFAULT_API_BASE_URL = "http://localhost:8000"

function normaliseBaseUrl(value: string) {
  return value.replace(/\/+$/, "")
}

function readApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL

  try {
    return normaliseBaseUrl(new URL(value).toString())
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must be an absolute URL, for example http://localhost:8000"
    )
  }
}

const env = {
  apiBaseUrl: readApiBaseUrl(),
} as const

export { env }
