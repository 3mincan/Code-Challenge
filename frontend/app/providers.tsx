"use client"

import { CopilotKit } from "@copilotkit/react-core"
import { QueryClientProvider } from "@tanstack/react-query"
import { MotionConfig } from "framer-motion"
import { useEffect, useState, type ReactNode } from "react"

import { COPILOT_RUNTIME_URL, RECIPE_AGENT_NAME } from "@/config/copilot"
import { createQueryClient } from "@/lib/query/client"
import { SkipLink } from "@/components/ui/skip-link"
import {
  readRecipeSession,
  subscribeToRecipeSession,
  type StoredRecipeSession,
} from "@/lib/recipe-session"

function useStoredRecipeSession() {
  const [session, setSession] = useState<StoredRecipeSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const refreshSession = () => {
      setSession(readRecipeSession())
      setHydrated(true)
    }

    refreshSession()
    return subscribeToRecipeSession(refreshSession)
  }, [])

  return { hydrated, session }
}

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const { hydrated, session } = useStoredRecipeSession()

  return (
    <QueryClientProvider client={queryClient}>
      <SkipLink />
      <MotionConfig reducedMotion="user">
        <CopilotKit
          agent={RECIPE_AGENT_NAME}
          runtimeUrl={COPILOT_RUNTIME_URL}
          showDevConsole={false}
          threadId={hydrated ? session?.threadId : undefined}
        >
          {children}
        </CopilotKit>
      </MotionConfig>
    </QueryClientProvider>
  )
}

export { Providers }
