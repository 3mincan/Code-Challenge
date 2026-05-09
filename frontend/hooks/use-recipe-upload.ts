"use client"

import { useMutation } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { uploadRecipeDocument } from "@/lib/api/upload"
import { storeRecipeSession } from "@/lib/recipe-session"
import type { UploadRecipeResponse } from "@/types/recipe"

const ACCEPTED_TYPES = new Set(["application/pdf", "text/plain"])
const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md"]
const MAX_FILE_SIZE = 12 * 1024 * 1024

type UploadPhase =
  | "idle"
  | "ready"
  | "uploading"
  | "parsing"
  | "success"
  | "error"

function isAcceptedFile(file: File) {
  const filename = file.name.toLowerCase()

  return (
    ACCEPTED_TYPES.has(file.type) ||
    ACCEPTED_EXTENSIONS.some((extension) => filename.endsWith(extension))
  )
}

function getFileValidationError(file: File) {
  if (!isAcceptedFile(file)) {
    return "Upload a PDF or plain text recipe."
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Keep the file under 12 MB for a smoother parse."
  }

  return null
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while uploading the recipe."
}

function useRecipeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<UploadPhase>("idle")
  const [progress, setProgress] = useState(0)
  const [clientError, setClientError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (selectedFile: File) =>
      uploadRecipeDocument({
        file: selectedFile,
        onProgress: (nextProgress) => {
          setProgress(nextProgress)
          if (nextProgress >= 82) {
            setPhase("parsing")
          }
        },
      }),
    onMutate: () => {
      setPhase("uploading")
      setProgress(8)
      setClientError(null)
    },
    onSuccess: (response) => {
      storeRecipeSession({ threadId: response.threadId, state: response.state })
      setProgress(100)
      setPhase("success")
    },
    onError: () => {
      setPhase("error")
    },
  })

  const selectedFileError = file ? getFileValidationError(file) : null
  const error = clientError ?? selectedFileError ?? getErrorText(mutation.error)

  const selectFile = useCallback((nextFile: File | null) => {
    setFile(nextFile)
    setProgress(0)
    setClientError(null)
    setPhase(nextFile ? "ready" : "idle")

    if (nextFile) {
      const validationError = getFileValidationError(nextFile)
      if (validationError) {
        setClientError(validationError)
        setPhase("error")
      }
    }
  }, [])

  const reset = useCallback(() => {
    setFile(null)
    setPhase("idle")
    setProgress(0)
    setClientError(null)
    mutation.reset()
  }, [mutation])

  const upload = useCallback(() => {
    if (!file) {
      setClientError("Choose a PDF or text recipe first.")
      setPhase("error")
      return
    }

    const validationError = getFileValidationError(file)
    if (validationError) {
      setClientError(validationError)
      setPhase("error")
      return
    }

    mutation.mutate(file)
  }, [file, mutation])

  const response = mutation.data

  return useMemo(
    () => ({
      error,
      file,
      isBusy: phase === "uploading" || phase === "parsing",
      phase,
      progress,
      reset,
      response: response as UploadRecipeResponse | undefined,
      selectFile,
      upload,
    }),
    [error, file, phase, progress, reset, response, selectFile, upload]
  )
}

export { MAX_FILE_SIZE, useRecipeUpload }
export type { UploadPhase }
