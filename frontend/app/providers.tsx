"use client"

import { CopilotKit } from "@copilotkit/react-core"
import { QueryClientProvider } from "@tanstack/react-query"
import { MotionConfig } from "framer-motion"
import { usePathname } from "next/navigation"
import { useState, useSyncExternalStore, type ReactNode } from "react"

import { COPILOT_RUNTIME_URL, RECIPE_AGENT_NAME } from "@/config/copilot"
import { createQueryClient } from "@/lib/query/client"
import {
  getThreadIdForRecipePath,
  subscribeToRecipeSession,
} from "@/lib/recipe-session"

function CopilotKitWithThread({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const threadId = useSyncExternalStore(
    subscribeToRecipeSession,
    () => getThreadIdForRecipePath(pathname) ?? undefined,
    () => undefined
  )

  return (
    <CopilotKit
      agent={RECIPE_AGENT_NAME}
      runtimeUrl={COPILOT_RUNTIME_URL}
      enableInspector={false}
      showDevConsole={false}
      threadId={threadId}
    >
      {children}
    </CopilotKit>
  )
}

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <CopilotKitWithThread>{children}</CopilotKitWithThread>
      </MotionConfig>
    </QueryClientProvider>
  )
}

export { Providers }
