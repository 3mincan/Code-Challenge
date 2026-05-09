"use client"

import { motion } from "framer-motion"

import { skeletonShimmer, transitions } from "@/components/ui/motion"
import { Surface } from "@/components/ui/surface"

const rows = ["w-11/12", "w-9/12", "w-10/12"]

function SkeletonLine({ className }: { className: string }) {
  return (
    <div
      className={`relative h-3 overflow-hidden rounded-full bg-hairline-soft ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-canvas/55 to-transparent"
        initial={{ x: "-60%" }}
        animate={{ x: "160%" }}
        transition={skeletonShimmer}
        aria-hidden
      />
    </div>
  )
}

function RecipeLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.panel}
    >
      <Surface variant="base" className="space-y-6 p-5">
        <div className="space-y-3">
          <SkeletonLine className="h-5 w-7/12" />
          <SkeletonLine className="w-5/12" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map((width, index) => (
            <motion.div
              key={width}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...transitions.quick,
                delay: 0.04 + index * 0.05,
              }}
              className="rounded-xl border border-hairline p-3"
            >
              <SkeletonLine className={width} />
            </motion.div>
          ))}
        </div>
        <div className="space-y-3">
          {rows.map((width, index) => (
            <motion.div
              key={width}
              initial={{ opacity: 0.5, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                ...transitions.quick,
                delay: 0.12 + index * 0.06,
              }}
            >
              <SkeletonLine className={width} />
            </motion.div>
          ))}
        </div>
      </Surface>
    </motion.div>
  )
}

export { RecipeLoadingSkeleton }
