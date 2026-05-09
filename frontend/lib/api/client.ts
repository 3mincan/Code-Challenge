import { env } from "@/config/env"
import { ApiError } from "@/lib/api/api-error"
import { getUserFacingApiMessage } from "@/lib/errors/user-message"

type ApiRequestOptions = RequestInit & {
  searchParams?: Record<string, string | number | boolean | undefined>
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
    throw new ApiError(
      getUserFacingApiMessage(response.status, body),
      response.status,
      body
    )
  }

  return body as TResponse
}

export { ApiError, apiFetch, createApiUrl }
export type { ApiRequestOptions }
