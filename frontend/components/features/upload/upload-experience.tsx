"use client"

import { AnimatePresence, motion } from "framer-motion"
import { BookMarked, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSyncExternalStore } from "react"

import { ConnectionBanner } from "@/components/feedback/connection-banner"
import { RecipeLoadingSkeleton } from "@/components/features/upload/recipe-loading-skeleton"
import { UploadDropzone } from "@/components/features/upload/upload-dropzone"
import { UploadProgress } from "@/components/features/upload/upload-progress"
import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Container, Section, Stack } from "@/components/ui/section"
import { Surface } from "@/components/ui/surface"
import { Text } from "@/components/ui/typography"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useRecipeUpload } from "@/hooks/use-recipe-upload"
import {
  getSavedRecipeSummariesServerSnapshot,
  getSavedRecipeSummariesSnapshot,
  hasIncompletePersistedSession,
  pruneIncompleteRecipeRecords,
  subscribeToRecipeSession,
} from "@/lib/recipe-session"

function UploadExperience() {
  const savedRecipes = useSyncExternalStore(
    subscribeToRecipeSession,
    getSavedRecipeSummariesSnapshot,
    getSavedRecipeSummariesServerSnapshot
  )
  const incompleteSession = useSyncExternalStore(
    subscribeToRecipeSession,
    () => hasIncompletePersistedSession(),
    () => false
  )
  const {
    canRetryUpload,
    error,
    file,
    isBusy,
    isExtractingImageText,
    phase,
    progress,
    retryUpload,
    selectFile,
    upload,
  } = useRecipeUpload()
  const online = useOnlineStatus()
  const progressLabel =
    phase === "parsing"
      ? "Reading and structuring recipe"
      : isExtractingImageText
        ? "Reading text from your image…"
        : "Uploading recipe"

  return (
    <AppShell>
      <ShellMain>
        <Section spacing="hero" className="overflow-x-hidden pb-6 sm:pb-8">
          <Container>
            <Stack className="gap-4 pb-2 sm:gap-6">
              <ConnectionBanner online={online} />
              {incompleteSession ? (
                <Surface
                  variant="rose"
                  className="flex flex-col gap-3 border border-hairline p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <Text variant="small-medium" measure="none">
                      Saved session without a recipe
                    </Text>
                    <Text variant="small" measure="none" tone="muted">
                      Remove uploads that never finished parsing so you can try
                      again. Completed recipes stay in &ldquo;Saved in this
                      browser&rdquo;.
                    </Text>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => pruneIncompleteRecipeRecords()}
                  >
                    Clear incomplete sessions
                  </Button>
                </Surface>
              ) : null}
            </Stack>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-0 flex-col justify-center"
              >
                <Stack className="gap-6 md:gap-6">
                  <Stack className="gap-4">
                    <Text as="h1" variant="hero" measure="xl">
                      Bring your recipe into focus.
                    </Text>
                    <Text variant="subtitle" measure="lg">
                      Start with a file. The companion will turn it into a calm,
                      structured cooking workspace at its own URL.
                    </Text>
                  </Stack>
                  <Surface
                    variant="cream"
                    className="flex items-start gap-4 p-5 text-charcoal"
                  >
                    <Sparkles
                      className="mt-1 size-5 shrink-0 text-brand-orange"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-2">
                      <Text
                        variant="small"
                        measure="none"
                        className="max-w-none text-slate"
                      >
                        PDFs, plain text, or recipe screenshots (PNG/JPEG).
                        Photos are converted to text in your browser before
                        upload.
                      </Text>
                    </div>
                  </Surface>
                </Stack>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-0 flex-col justify-center space-y-6"
              >
                <UploadDropzone
                  canRetry={canRetryUpload}
                  disabled={isBusy}
                  error={phase === "error" ? error : null}
                  file={file}
                  onFileSelect={selectFile}
                  onRetry={retryUpload}
                  onUpload={upload}
                />
                <AnimatePresence>
                  {isBusy ? (
                    <motion.div
                      key="busy"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-4"
                    >
                      <UploadProgress
                        progress={progress}
                        label={progressLabel}
                      />
                      {phase === "parsing" ? <RecipeLoadingSkeleton /> : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </div>
            {savedRecipes.length > 0 ? (
              <Surface
                variant="cream"
                className="mt-10 border border-hairline/80 p-5 sm:mt-12 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-tint-yellow-bold/90 text-ink shadow-elevation-1">
                    <BookMarked className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <Text variant="small-medium" measure="none">
                        Saved in this browser
                      </Text>
                      <Text variant="small" measure="none" tone="muted">
                        Re-open a recipe you already uploaded. Links stay valid
                        on this device until you clear site data.
                      </Text>
                    </div>
                    <ul className="divide-y divide-hairline-soft rounded-lg border border-hairline-soft bg-canvas/80">
                      {savedRecipes.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={`/recipe/${r.id}`}
                            className="flex min-h-12 items-center justify-between gap-3 px-3 py-2.5 text-body-sm-medium text-ink transition-colors hover:bg-surface-soft/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] sm:px-4"
                          >
                            <span className="min-w-0 truncate">{r.title}</span>
                            <ChevronRight
                              className="size-4 shrink-0 text-slate"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Surface>
            ) : null}
          </Container>
        </Section>
      </ShellMain>
    </AppShell>
  )
}

export { UploadExperience }
