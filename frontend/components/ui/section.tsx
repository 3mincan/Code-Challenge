import type { ComponentPropsWithoutRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "",
      sm: "py-12",
      md: "section-pad",
      lg: "section-pad-lg",
      hero: "section-pad-hero",
    },
    tone: {
      canvas: "bg-canvas text-ink",
      soft: "bg-surface-soft text-ink",
      surface: "bg-surface text-ink",
      navy: "bg-brand-navy text-on-dark",
    },
  },
  defaultVariants: {
    spacing: "md",
    tone: "canvas",
  },
})

function Section({
  className,
  spacing,
  tone,
  ...props
}: ComponentPropsWithoutRef<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ spacing, tone, className }))}
      {...props}
    />
  )
}

function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="container"
      className={cn("container-page", className)}
      {...props}
    />
  )
}

const Stack = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-[var(--space-md)]", className)} {...props} />
)

const Cluster = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-[var(--space-sm)]",
      className,
    )}
    {...props}
  />
)

export { Cluster, Container, Section, Stack, sectionVariants }
