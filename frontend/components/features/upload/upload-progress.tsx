"use client"

import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

type UploadProgressProps = {
  progress: number
  label: string
  className?: string
}

function UploadProgress({ progress, label, className }: UploadProgressProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={cn("space-y-3", className)}
      >
        <div className="flex items-center justify-between gap-4 text-body-sm-medium text-slate">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-hairline-soft">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export { UploadProgress }
