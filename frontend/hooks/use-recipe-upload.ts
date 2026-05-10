"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

import {
  imageFileToPlainTextFile,
  isRecipeImageFile,
} from "@/lib/upload/recipe-image-ocr"
import { uploadRecipeDocument } from "@/lib/api/upload"
import { getUserFacingMessage } from "@/lib/errors/user-message"
import { registerRecipeUpload } from "@/lib/recipe-session"

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
])
const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]
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
    return "Upload a PDF, plain text recipe, or a recipe screenshot (PNG, JPEG, WebP, GIF)."
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Keep the file under 12 MB for a smoother parse."
  }

  return null
}

function normaliseFilenameForBackend(file: File): File {
  const name = file.name
  if (/\.pdf$/i.test(name) && !name.endsWith(".pdf")) {
    return new File([file], name.replace(/\.pdf$/i, ".pdf"), {
      type: file.type || "application/pdf",
      lastModified: file.lastModified,
    })
  }
  return file
}

function useRecipeUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<UploadPhase>("idle")
  const [progress, setProgress] = useState(0)
  const [clientError, setClientError] = useState<string | null>(null)
  const [isExtractingImageText, setIsExtractingImageText] = useState(false)

  const mutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      const image = isRecipeImageFile(selectedFile)
      let fileToSend = selectedFile

      if (image) {
        setIsExtractingImageText(true)
        try {
          fileToSend = await imageFileToPlainTextFile(selectedFile, {
            onProgress: (ocrPct: number) => {
              setProgress(8 + Math.round((ocrPct / 100) * 34))
            },
          })
        } finally {
          setIsExtractingImageText(false)
        }
      } else {
        fileToSend = normaliseFilenameForBackend(selectedFile)
      }

      return uploadRecipeDocument({
        file: fileToSend,
        onProgress: (nextProgress) => {
          if (image) {
            const scaled = 42 + Math.round((nextProgress / 82) * 52)
            setProgress(Math.min(97, scaled))
          } else {
            setProgress(nextProgress)
          }
          if (nextProgress >= 82) {
            setPhase("parsing")
          }
        },
      })
    },
    onMutate: () => {
      setPhase("uploading")
      setProgress(8)
      setClientError(null)
    },
    onSuccess: (response) => {
      const id = registerRecipeUpload(response)
      setProgress(100)
      setPhase("success")
      router.replace(`/recipe/${id}`)
    },
    onError: () => {
      setPhase("error")
    },
  })

  const selectedFileError = file ? getFileValidationError(file) : null
  const serverMessage = mutation.error
    ? getUserFacingMessage(mutation.error)
    : null
  const error = clientError ?? selectedFileError ?? serverMessage

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
    setIsExtractingImageText(false)
    mutation.reset()
  }, [mutation])

  const upload = useCallback(() => {
    if (!file) {
      setClientError("Choose a PDF, text file, or recipe image first.")
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

  const retryUpload = useCallback(() => {
    if (!file) {
      return
    }

    const validationError = getFileValidationError(file)
    if (validationError) {
      setClientError(validationError)
      setPhase("error")
      return
    }

    mutation.reset()
    mutation.mutate(file)
  }, [file, mutation])

  const canRetryUpload =
    phase === "error" &&
    mutation.isError &&
    Boolean(file) &&
    (file ? getFileValidationError(file) === null : false)

  return useMemo(
    () => ({
      canRetryUpload,
      error,
      file,
      isBusy: phase === "uploading" || phase === "parsing",
      isExtractingImageText,
      phase,
      progress,
      reset,
      retryUpload,
      selectFile,
      upload,
    }),
    [
      canRetryUpload,
      error,
      file,
      phase,
      progress,
      isExtractingImageText,
      reset,
      retryUpload,
      selectFile,
      upload,
    ]
  )
}

export { useRecipeUpload }
export type { UploadPhase }
