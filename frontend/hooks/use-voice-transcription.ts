"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"

type VoiceStatus = "idle" | "listening"

type UseVoiceTranscriptionOptions = {
  /** BCP 47 tag, e.g. en-GB */
  lang?: string
  onFinalTranscript: (text: string) => void
  onRecognizerError?: (message: string) => void
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") {
    return null
  }

  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }

  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null
}

function errorMessageForCode(code: string): string {
  if (code === "not-allowed") {
    return "Microphone permission was denied."
  }
  if (code === "no-speech") {
    return "No speech detected — try again."
  }
  if (code === "aborted") {
    return "Voice capture was aborted."
  }
  if (code === "network") {
    return "Speech recognition needs a network connection."
  }
  return "Voice recognition failed."
}

function useVoiceTranscription({
  lang = "en-GB",
  onFinalTranscript,
  onRecognizerError,
}: UseVoiceTranscriptionOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [lastError, setLastError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onFinalRef = useRef(onFinalTranscript)
  const onErrorRef = useRef(onRecognizerError)

  useLayoutEffect(() => {
    onFinalRef.current = onFinalTranscript
    onErrorRef.current = onRecognizerError
  }, [onFinalTranscript, onRecognizerError])

  const supported = useMemo(() => isSpeechRecognitionSupported(), [])

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    recognitionRef.current = null
    setStatus("idle")
  }, [])

  const start = useCallback(() => {
    const Constructor = getSpeechRecognitionConstructor()
    if (!Constructor) {
      const msg =
        "Voice input is not available in this browser. Try Chrome or Edge."
      setLastError(msg)
      onErrorRef.current?.(msg)
      return
    }

    stop()

    const recognition = new Constructor()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript?.trim() ?? ""
      if (text) {
        onFinalRef.current(text)
      }
      setStatus("idle")
      recognitionRef.current = null
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = errorMessageForCode(event.error)
      setLastError(msg)
      onErrorRef.current?.(msg)
      setStatus("idle")
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setStatus("idle")
      recognitionRef.current = null
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setStatus("listening")
      setLastError(null)
    } catch {
      const msg = "Could not start microphone. Check permissions."
      setLastError(msg)
      onErrorRef.current?.(msg)
      recognitionRef.current = null
      setStatus("idle")
    }
  }, [lang, stop])

  const clearError = useCallback(() => setLastError(null), [])

  const toggle = useCallback(() => {
    if (status === "listening") {
      stop()
    } else {
      start()
    }
  }, [start, status, stop])

  return {
    supported,
    status,
    lastError,
    start,
    stop,
    toggle,
    clearError,
  }
}

export { useVoiceTranscription }
export type { VoiceStatus }
