"use client"

import { useCopilotChatHeadless_c } from "@copilotkit/react-core"
import { Mic } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { TactileButton } from "@/components/ui/tactile-button"
import { Text } from "@/components/ui/typography"
import { routeCookingVoiceCommand } from "@/lib/cooking-voice-commands"
import { getUserFacingMessage } from "@/lib/errors/user-message"
import { cn } from "@/lib/utils"
import { useVoiceTranscription } from "@/hooks/use-voice-transcription"

type CookingVoiceControlProps = {
  currentStepIndex: number
  stepCount: number
  currentStepInstruction: string
  onGoToStep: (index: number) => void
  agentBusy: boolean
  className?: string
}

function CookingVoiceControl({
  currentStepIndex,
  stepCount,
  currentStepInstruction,
  onGoToStep,
  agentBusy,
  className,
}: CookingVoiceControlProps) {
  const { sendMessage } = useCopilotChatHeadless_c()
  const [liveMessage, setLiveMessage] = useState("")

  const announce = useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  const handleFinal = useCallback(
    async (text: string) => {
      announce(`Heard: ${text}`)

      const route = routeCookingVoiceCommand(text, {
        currentStepInstruction,
      })

      if (route.kind === "local") {
        if (route.action === "next") {
          onGoToStep(Math.min(currentStepIndex + 1, stepCount - 1))
          announce("Next step")
          return
        }
        onGoToStep(Math.max(currentStepIndex - 1, 0))
        announce("Previous step")
        return
      }

      announce("Asking Chef…")
      try {
        await sendMessage({
          id: crypto.randomUUID(),
          role: "user",
          content: route.message,
        })
        announce("Sent to Chef")
      } catch (err) {
        announce(getUserFacingMessage(err))
      }
    },
    [
      announce,
      currentStepIndex,
      currentStepInstruction,
      onGoToStep,
      sendMessage,
      stepCount,
    ]
  )

  const {
    supported,
    status,
    lastError,
    toggle,
    stop,
    clearError,
  } = useVoiceTranscription({
    onFinalTranscript: handleFinal,
    onRecognizerError: (msg) => announce(msg),
  })

  const listening = status === "listening"
  const disabled = agentBusy || !supported

  return (
    <div className={cn("flex flex-col items-stretch gap-1", className)}>
      <TactileButton
        type="button"
        variant={listening ? "primary" : "outline"}
        size="icon"
        disabled={disabled}
        aria-pressed={listening}
        aria-label={
          supported
            ? listening
              ? "Stop voice input"
              : "Start voice input"
            : "Voice input not supported in this browser"
        }
        title={
          supported
            ? "Speak: next step, previous step, repeat step, scale to N servings, or replace an ingredient"
            : "Voice input requires a supported browser (e.g. Chrome, Edge)"
        }
        className="size-12 shrink-0 touch-manipulation rounded-xl sm:size-11"
        onClick={() => {
          clearError()
          toggle()
        }}
      >
        <Mic
          className={cn("size-6", listening && "motion-standard")}
          strokeWidth={listening ? 2.25 : 2}
          aria-hidden
        />
      </TactileButton>

      <span className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </span>

      {lastError ? (
        <Text
          variant="small"
          tone="muted"
          measure="none"
          className="max-w-[11rem] text-center text-balance sm:max-w-none"
        >
          {lastError}
        </Text>
      ) : null}

      {listening ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-auto min-h-0 py-1 text-caption-bold text-slate"
          onClick={stop}
        >
          Cancel
        </Button>
      ) : null}
    </div>
  )
}

export { CookingVoiceControl }
