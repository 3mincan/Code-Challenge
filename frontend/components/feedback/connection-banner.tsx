"use client"

import { motion, AnimatePresence } from "framer-motion"
import { WifiOff } from "lucide-react"

import { transitions } from "@/components/ui/motion"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

type ConnectionBannerProps = {
  online: boolean
  className?: string
}

function ConnectionBanner({ online, className }: ConnectionBannerProps) {
  return (
    <AnimatePresence>
      {!online ? (
        <motion.div
          key="offline"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={transitions.panel}
          className={cn("overflow-hidden", className)}
        >
          <div className="flex items-start gap-3 rounded-xl border border-hairline-strong bg-tint-peach/90 px-4 py-3 text-ink shadow-elevation-1">
            <WifiOff className="mt-0.5 size-5 shrink-0 text-brand-orange" aria-hidden />
            <div>
              <Text variant="small-medium" measure="none">
                You appear to be offline
              </Text>
              <Text variant="small" tone="muted" measure="none" className="mt-1">
                Reconnect to upload files and sync with Chef. Anything already
                on screen may still be readable.
              </Text>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export { ConnectionBanner }
