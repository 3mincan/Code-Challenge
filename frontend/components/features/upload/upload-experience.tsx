"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FileUp, Sparkles } from "lucide-react"

import { ConnectionBanner } from "@/components/feedback/connection-banner"
import { RecipeHandoff } from "@/components/features/upload/recipe-handoff"
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
import { clearRecipeSession } from "@/lib/recipe-session"

type UploadExperienceProps = {
  incompleteSession?: boolean
}

function UploadExperience({ incompleteSession = false }: UploadExperienceProps) {
  const {
    canRetryUpload,
    error,
    file,
    isBusy,
    phase,
    progress,
    reset,
    response,
    retryUpload,
    selectFile,
    upload,
  } = useRecipeUpload()
  const online = useOnlineStatus()
  const isSuccess = phase === "success" && response
  const progressLabel =
    phase === "parsing" ? "Reading and structuring recipe" : "Uploading recipe"

  return (
    <AppShell>
      <ShellMain>
        <Section spacing="hero" className="overflow-hidden">
          <Container>
            <Stack className="gap-6 pb-2">
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
                      Clear the saved session to upload again, or continue if
                      you still have the file below.
                    </Text>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => clearRecipeSession()}
                  >
                    Clear session
                  </Button>
                </Surface>
              ) : null}
            </Stack>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                <Stack className="gap-6 lg:sticky lg:top-10">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-tint-yellow-bold text-ink shadow-elevation-1">
                    <FileUp className="size-6" />
                  </div>
                  <Stack className="gap-4">
                    <Text as="h1" variant="hero" measure="xl">
                      Bring your recipe into focus.
                    </Text>
                    <Text variant="subtitle" measure="lg">
                      Start with a file. The companion will turn it into a calm,
                      structured cooking workspace.
                    </Text>
                  </Stack>
                  <Surface
                    variant="cream"
                    className="flex items-start gap-4 p-5"
                  >
                    <Sparkles className="mt-1 size-5 shrink-0 text-brand-orange" />
                    <Text variant="small" measure="none">
                      Works with recipe PDFs and plain text files. For best
                      results, include both ingredients and method steps.
                    </Text>
                  </Surface>
                </Stack>
              </motion.div>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <RecipeHandoff
                    key="success"
                    response={response}
                    onReset={reset}
                  />
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
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
                          {phase === "parsing" ? (
                            <RecipeLoadingSkeleton />
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>
      </ShellMain>
    </AppShell>
  )
}

export { UploadExperience }
