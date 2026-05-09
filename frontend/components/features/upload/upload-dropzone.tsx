"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FileText, Upload, X } from "lucide-react"
import { useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import { TactileButton } from "@/components/ui/tactile-button"
import { Cluster, Stack } from "@/components/ui/section"
import { transitions } from "@/components/ui/motion"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

type UploadDropzoneProps = {
  canRetry?: boolean
  disabled?: boolean
  error?: string | null
  file: File | null
  onFileSelect: (file: File | null) => void
  onRetry?: () => void
  onUpload: () => void
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function UploadDropzone({
  canRetry = false,
  disabled,
  error,
  file,
  onFileSelect,
  onRetry,
  onUpload,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const openPicker = () => {
    inputRef.current?.click()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    if (disabled) {
      return
    }

    onFileSelect(event.dataTransfer.files.item(0))
  }

  return (
    <div className="space-y-5">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Upload recipe file"
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={
          disabled ? undefined : { scale: 1.004, transition: transitions.quick }
        }
        whileTap={disabled ? undefined : { scale: 0.996 }}
        className={cn(
          "motion-standard cursor-pointer rounded-2xl border border-dashed bg-canvas p-6 text-left shadow-elevation-2 transition-[background-color,border-color,box-shadow,transform] sm:p-8",
          "min-h-[24rem] touch-target flex flex-col justify-between gap-8",
          isDragging
            ? "border-primary bg-tint-lavender shadow-elevation-3"
            : "border-hairline-strong",
          disabled && "pointer-events-none opacity-70",
          error && "border-destructive bg-destructive/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.txt,.md,application/pdf,text/plain"
          disabled={disabled}
          onChange={(event) => {
            onFileSelect(event.target.files?.item(0) ?? null)
            event.target.value = ""
          }}
        />

        <Stack className="gap-5">
          <div className="flex size-14 items-center justify-center rounded-lg bg-tint-yellow text-ink shadow-elevation-1">
            <Upload className="size-6" />
          </div>
          <Stack className="gap-3">
            <Text as="h2" variant="h2" measure="lg">
              Drop in a recipe, or tap to choose one.
            </Text>
            <Text measure="lg">
              Upload a PDF or plain text recipe. The companion will read it,
              structure the ingredients and steps, then prepare your cooking
              workspace.
            </Text>
          </Stack>
        </Stack>

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-lg border border-hairline bg-surface-soft p-4"
            >
              <Cluster className="justify-between gap-4">
                <Cluster className="min-w-0 gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-canvas text-ink">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-body-sm-medium text-ink">
                      {file.name}
                    </p>
                    <p className="text-body-sm text-slate">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </Cluster>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove selected file"
                  onClick={(event) => {
                    event.stopPropagation()
                    onFileSelect(null)
                  }}
                >
                  <X />
                </Button>
              </Cluster>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 text-body-sm text-slate sm:grid-cols-3"
            >
              <span>PDF files</span>
              <span>Plain text</span>
              <span>Ready for cooking</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="err"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={transitions.quick}
                className="rounded-xl border border-destructive/35 bg-destructive/8 px-4 py-3"
              >
                <Text variant="small-medium" measure="none" className="text-ink">
                  Could not finish that upload
                </Text>
                <Text
                  variant="small"
                  measure="none"
                  className="mt-2 text-charcoal"
                >
                  {error}
                </Text>
                {canRetry && onRetry ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={disabled}
                      onClick={onRetry}
                    >
                      Try again
                    </Button>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body-sm text-stone"
              >
                Text files work best when they contain ingredients and method
                steps.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <TactileButton
          type="button"
          size="lg"
          disabled={!file || disabled}
          onClick={onUpload}
        >
          Parse recipe
        </TactileButton>
      </div>
    </div>
  )
}

export { UploadDropzone }
