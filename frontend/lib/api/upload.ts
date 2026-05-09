import { ApiError, createApiUrl } from "@/lib/api/client"
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

function getErrorMessage(statusText: string, body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return body.detail
  }

  return statusText || "Upload failed"
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
            getErrorMessage(request.statusText, body),
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
        new Error("Could not reach the recipe service. Is the backend running?")
      )
    }

    request.ontimeout = () => {
      reject(new Error("The upload took too long. Please try again."))
    }

    request.timeout = 120_000
    request.send(formData)
  })
}

export { uploadRecipeDocument }
export type { UploadRecipeOptions }
