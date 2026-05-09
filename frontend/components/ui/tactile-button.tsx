"use client"

import { motion } from "framer-motion"
import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef } from "react"

import { buttonVariants } from "@/components/ui/button"
import { transitions } from "@/components/ui/motion"
import { cn } from "@/lib/utils"

type TactileButtonProps = ComponentPropsWithoutRef<typeof motion.button> &
  VariantProps<typeof buttonVariants>

/**
 * Primary actions with Framer hover/tap scale; matches `Button` visuals.
 * Uses a native `motion.button` to avoid handler clashes with Base UI.
 */
function TactileButton({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: TactileButtonProps) {
  return (
    <motion.button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={{ scale: 1.008 }}
      whileTap={{ scale: 0.986 }}
      transition={transitions.quick}
      {...props}
    />
  )
}

export { TactileButton }
