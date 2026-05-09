import { env } from "@/config/env"

type ApiRequestOptions = RequestInit & {
  searchParams?: Record<string, string | number | boolean | undefined>
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function createApiUrl(
  path: string,
  searchParams?: ApiRequestOptions["searchParams"]
) {
  const url = new URL(path, `${env.apiBaseUrl}/`)

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  return url
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

async function apiFetch<TResponse>(
  path: string,
  { headers, searchParams, ...init }: ApiRequestOptions = {}
) {
  const response = await fetch(createApiUrl(path, searchParams), {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  })
  const body = await readResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response.statusText, response.status, body)
  }

  return body as TResponse
}

export { ApiError, apiFetch, createApiUrl }
export type { ApiRequestOptions }
