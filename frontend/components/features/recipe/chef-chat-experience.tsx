"use client"

import type { CopilotChatProps } from "@copilotkit/react-core/v2"
import { motion } from "framer-motion"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const typingEase = [0.16, 1, 0.3, 1] as const

/** Replaces the default pulsing dot while the assistant is generating (streaming). */
function ChefTypingIndicator({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chef is replying"
      className={cn(
        "cpk:flex cpk:items-center cpk:gap-3 cpk:py-2 cpk:pl-1",
        className
      )}
      {...rest}
    >
      <span className="cpk:flex cpk:items-center cpk:gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="cpk:size-2 cpk:rounded-full cpk:bg-primary/65"
            animate={{
              opacity: [0.35, 1, 0.35],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.15,
              repeat: Infinity,
              delay: i * 0.14,
              ease: typingEase,
            }}
          />
        ))}
      </span>
      <span className="cpk:text-body-sm cpk:text-slate">Chef is replying…</span>
    </div>
  )
}

/**
 * Visual and interaction overrides for CopilotPopup / CopilotChat.
 * Streaming and multi-turn behaviour stay wired inside CopilotKit; this layer
 * only shapes hierarchy, touch targets, and loading affordances.
 */
function getRecipeChefChatProps(): Pick<
  CopilotChatProps,
  | "className"
  | "throttleMs"
  | "messageView"
  | "input"
  | "suggestionView"
  | "scrollView"
> {
  return {
    className: cn(
      "recipe-chef-chat-root cpk:bg-canvas [&_.copilotKitChat]:cpk:bg-canvas"
    ),
    throttleMs: 48,
    messageView: {
      className: "cpk:gap-4",
      cursor: ChefTypingIndicator,
      assistantMessage: {
        toolbarVisible: false,
        className: cn(
          "cpk:rounded-2xl cpk:border cpk:border-hairline cpk:bg-surface-soft",
          "cpk:px-4 cpk:py-3.5 cpk:shadow-none cpk:max-w-[min(100%,36rem)]"
        ),
        markdownRenderer: {
          className: cn(
            "cpk:text-body-md cpk:text-charcoal cpk:leading-relaxed",
            "[&_p+p]:cpk:mt-3 [&_ul]:cpk:mt-2 [&_ul]:cpk:list-disc [&_ul]:cpk:pl-5",
            "[&_ul]:cpk:space-y-1 [&_ol]:cpk:mt-2 [&_ol]:cpk:list-decimal [&_ol]:cpk:pl-5",
            "[&_strong]:cpk:font-medium [&_code]:cpk:rounded-sm [&_code]:cpk:bg-hairline-soft [&_code]:cpk:px-1",
            "[&_pre]:cpk:mt-2 [&_pre]:cpk:overflow-x-auto [&_pre]:cpk:rounded-lg [&_pre]:cpk:bg-surface-soft [&_pre]:cpk:p-3"
          ),
        },
      },
      userMessage: {
        className: cn(
          "cpk:rounded-2xl cpk:border cpk:border-hairline-strong cpk:bg-tint-cream",
          "cpk:px-4 cpk:py-3.5 cpk:max-w-[min(100%,32rem)] cpk:ml-auto"
        ),
        toolbar: {
          className: "cpk:hidden",
        },
      },
      reasoningMessage: {
        className: cn(
          "cpk:rounded-xl cpk:border cpk:border-dashed cpk:border-hairline cpk:bg-canvas",
          "cpk:px-3 cpk:py-2 cpk:text-body-sm cpk:text-slate"
        ),
        header: {
          className: "cpk:text-caption cpk:font-medium cpk:uppercase cpk:tracking-wide cpk:text-stone",
        },
      },
    },
    input: {
      className: cn(
        "cpk:pointer-events-auto cpk:border-t cpk:border-hairline-soft",
        "cpk:bg-canvas/95 cpk:backdrop-blur-sm",
        "cpk:px-3 cpk:pt-3 cpk:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      ),
      textArea: {
        className: cn(
          "cpk:min-h-[3.25rem] cpk:rounded-xl cpk:border-hairline cpk:bg-canvas",
          "cpk:px-4 cpk:py-3 cpk:text-body-md cpk:leading-normal",
          "cpk:transition-[box-shadow,border-color]",
          "focus-visible:cpk:border-primary/35 focus-visible:cpk:ring-2 focus-visible:cpk:ring-ring/25"
        ),
      },
      sendButton: {
        className: cn(
          "cpk:min-h-11 cpk:min-w-11 cpk:shrink-0 cpk:rounded-xl cpk:touch-manipulation"
        ),
      },
      showDisclaimer: false,
    },
    suggestionView: {
      container: {
        className: "cpk:gap-2",
      },
      suggestion: {
        className: cn(
          "cpk:min-h-10 cpk:rounded-full cpk:border cpk:border-hairline-strong cpk:bg-canvas",
          "cpk:px-4 cpk:py-2.5 cpk:text-left cpk:text-body-sm-medium cpk:text-ink",
          "cpk:shadow-none cpk:transition-transform cpk:touch-manipulation cpk:active:scale-[0.98]"
        ),
      },
    },
    scrollView: {
      className: "cpk:bg-canvas",
    },
  }
}

export { ChefTypingIndicator, getRecipeChefChatProps }
