"use client"

import { motion } from "framer-motion"

import { Surface } from "@/components/ui/surface"

const rows = ["w-11/12", "w-9/12", "w-10/12"]

function SkeletonLine({ className }: { className: string }) {
  return (
    <motion.div
      className={`h-3 rounded-full bg-hairline-soft ${className}`}
      animate={{ opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

function RecipeLoadingSkeleton() {
  return (
    <Surface variant="base" className="space-y-6 p-5">
      <div className="space-y-3">
        <SkeletonLine className="h-5 w-7/12" />
        <SkeletonLine className="w-5/12" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((width) => (
          <div key={width} className="rounded-lg border border-hairline p-3">
            <SkeletonLine className={width} />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((width) => (
          <SkeletonLine key={width} className={width} />
        ))}
      </div>
    </Surface>
  )
}

export { RecipeLoadingSkeleton }
