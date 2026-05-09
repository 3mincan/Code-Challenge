import { ApiError } from "@/lib/api/api-error"
import { createApiUrl } from "@/lib/api/client"
import { getUserFacingApiMessage } from "@/lib/errors/user-message"
import type { UploadRecipeResponse } from "@/types/recipe"

type UploadRecipeOptions = {
  file: File
  onProgress?: (progress: number) => void
}

function parseBody(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

function getUploadErrorMessage(status: number, body: unknown): string {
  return getUserFacingApiMessage(status, body)
}

function uploadRecipeDocument({
  file,
  onProgress,
}: UploadRecipeOptions): Promise<UploadRecipeResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)

    const request = new XMLHttpRequest()
    request.open("POST", createApiUrl("/upload").toString())
    request.responseType = "text"

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 82))
      }
    }

    request.onload = () => {
      const body = parseBody(request.responseText)

      if (request.status < 200 || request.status >= 300) {
        reject(
          new ApiError(
            getUploadErrorMessage(request.status, body),
            request.status,
            body
          )
        )
        return
      }

      onProgress?.(100)
      resolve(body as UploadRecipeResponse)
    }

    request.onerror = () => {
      reject(
        new Error(
          "We could not reach the recipe service. Check that it is running and you are online, then try again."
        )
      )
    }

    request.ontimeout = () => {
      reject(
        new Error(
          "This is taking longer than expected. Check your connection and try again."
        )
      )
    }

    request.timeout = 120_000
    request.send(formData)
  })
}

export { uploadRecipeDocument }
export type { UploadRecipeOptions }
