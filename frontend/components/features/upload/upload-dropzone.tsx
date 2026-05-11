"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FileText, Sparkles, Upload, X } from "lucide-react"
import { useId, useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { Surface } from "@/components/ui/surface"
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
  const introId = useId()
  const hintId = useId()
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
        role="region"
        aria-label="Recipe file upload. Use the Upload button or drag a file into this area."
        aria-describedby={`${introId} ${hintId}`}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "motion-standard rounded-2xl border border-dashed bg-canvas p-6 text-left shadow-elevation-2 transition-[background-color,border-color,box-shadow] sm:p-8",
          "min-h-[clamp(14rem,40dvh,22rem)] flex flex-col justify-between gap-6 sm:min-h-[19rem] sm:gap-8 md:min-h-[21rem]",
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
          accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp,.gif,application/pdf,text/plain,image/png,image/jpeg,image/webp,image/gif"
          disabled={disabled}
          onChange={(event) => {
            onFileSelect(event.target.files?.item(0) ?? null)
            event.target.value = ""
          }}
        />

        <Stack className="gap-4">
          <Button
            type="button"
            size="lg"
            className="w-full touch-manipulation sm:w-auto sm:min-w-[12rem]"
            disabled={disabled}
            onClick={() => openPicker()}
          >
            <Upload
              data-icon="inline-start"
              className="size-6"
              aria-hidden
            />
            Upload
          </Button>

          <div id={introId} className="min-w-0">
            <Text
              variant="small"
              measure="none"
              className="max-w-none text-slate"
            >
              The companion separates ingredients from the method for you. It
              stays most accurate when those two are already easy to
              distinguish—ideally a clear list plus short, ordered steps
              (bullets or numbers both help).
            </Text>
          </div>

          <Surface
            variant="cream"
            className="flex items-start gap-4 p-5 text-charcoal"
          >
            <Sparkles
              className="mt-1 size-5 shrink-0 text-brand-orange"
              aria-hidden
            />
            <div id={hintId} className="min-w-0 space-y-2">
              <Text
                variant="small"
                measure="none"
                className="max-w-none text-slate"
              >
                Text files work best when they contain ingredients and method
                steps.
              </Text>
            </div>
          </Surface>
        </Stack>

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <Panel className="bg-surface-soft p-4">
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
              </Panel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
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
                <Text
                  variant="small-medium"
                  measure="none"
                  className="text-ink"
                >
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
            ) : null}
          </AnimatePresence>
        </div>
        <TactileButton
          type="button"
          size="lg"
          disabled={!file || disabled}
          onClick={onUpload}
        >
          Continue with this file
        </TactileButton>
      </div>
    </div>
  )
}

export { UploadDropzone }
