/** Client-side OCR so screenshot uploads become UTF-8 text for POST /upload (backend text path). */

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
])

function isRecipeImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) {
    return true
  }
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name)
}

function sanitiseBaseName(name: string): string {
  const withoutExt = name.replace(/\.[^.]+$/i, "")
  return withoutExt.replace(/[/\\?%*:|"<>]/g, "").trim() || "recipe-screenshot"
}

/**
 * Run Tesseract in the browser (English ``eng`` only), then build a ``text/plain`` ``File`` (``*.txt``)
 * so the API uses ``content.decode("utf-8")``, not the PDF branch.
 */
async function imageFileToPlainTextFile(
  file: File,
  options?: { onProgress?: (percent: number) => void }
): Promise<File> {
  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker("eng", undefined, {
    logger: (message) => {
      if (
        message.status === "recognizing text" &&
        typeof message.progress === "number"
      ) {
        options?.onProgress?.(Math.min(100, Math.round(message.progress * 100)))
      }
    },
  })

  try {
    const {
      data: { text },
    } = await worker.recognize(file)
    const cleaned = text.trim()
    if (!cleaned) {
      throw new Error(
        "No text could be read from the image. Try a sharper screenshot or a PDF/text file."
      )
    }
    const base = sanitiseBaseName(file.name)
    return new File([cleaned], `${base}.txt`, {
      type: "text/plain",
    })
  } finally {
    await worker.terminate()
  }
}

export { imageFileToPlainTextFile, isRecipeImageFile }
