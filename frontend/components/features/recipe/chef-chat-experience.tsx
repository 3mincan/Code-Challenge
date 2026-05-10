"use client"

import type { CopilotChatProps } from "@copilotkit/react-core/v2"
import { CopilotChatInput } from "@copilotkit/react-core/v2"
import type { ComponentPropsWithoutRef } from "react"

type SendButtonProps = ComponentPropsWithoutRef<
  typeof CopilotChatInput.SendButton
>

/**
 * Icon-only default send/stop control — Lighthouse needs an explicit accessible name.
 */
function AccessibleChefSendButton(props: SendButtonProps) {
  const isStopMode = props.children != null && props.children !== false

  return (
    <CopilotChatInput.SendButton
      {...props}
      aria-label={isStopMode ? "Stop generating" : "Send message"}
    />
  )
}

/**
 * Behaviour-only hooks for CopilotPopup — no theme or layout overrides.
 */
function getRecipeChefChatProps(): Pick<
  CopilotChatProps,
  "throttleMs" | "messageView" | "input"
> {
  return {
    throttleMs: 48,
    messageView: {
      assistantMessage: {
        toolbarVisible: false,
      },
    },
    input: {
      showDisclaimer: true,
      /** Radix wraps the trigger; icon-only `<Plus />` still needs `aria-label` for SR. */
      addMenuButton: {
        "aria-label": "Add attachments",
      },
      sendButton: AccessibleChefSendButton,
    },
  }
}

export { getRecipeChefChatProps }
