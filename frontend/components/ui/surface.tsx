import type { ComponentPropsWithoutRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva("text-card-foreground", {
  variants: {
    variant: {
      base: "rounded-xl border border-hairline bg-canvas p-6",
      recipe:
        "rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6",
      feature: "rounded-xl border border-hairline bg-canvas p-8",
      agent: "rounded-xl border border-hairline bg-canvas p-6",
      template: "rounded-xl border border-hairline bg-canvas p-5",
      pricing: "rounded-xl border border-hairline bg-canvas p-8",
      "pricing-featured": "rounded-xl border-2 border-primary bg-surface p-8",
      "yellow-bold": "rounded-xl bg-tint-yellow-bold p-8 text-charcoal",
      peach: "rounded-xl bg-tint-peach p-8 text-charcoal",
      rose: "rounded-xl bg-tint-rose p-8 text-charcoal",
      mint: "rounded-xl bg-tint-mint p-8 text-charcoal",
      lavender: "rounded-xl bg-tint-lavender p-8 text-charcoal",
      sky: "rounded-xl bg-tint-sky p-8 text-charcoal",
      yellow: "rounded-xl bg-tint-yellow p-8 text-charcoal",
      cream: "rounded-xl bg-tint-cream p-8 text-charcoal",
      mockup:
        "rounded-xl border border-hairline bg-canvas p-4 shadow-elevation-3",
      "hero-band": "bg-brand-navy text-on-dark",
      "cta-light": "rounded-xl bg-surface p-10 text-ink",
    },
    elevation: {
      none: "",
      subtle: "shadow-elevation-1",
      card: "shadow-elevation-2",
      mockup: "shadow-elevation-3",
      modal: "shadow-elevation-4",
    },
  },
  defaultVariants: {
    variant: "base",
    elevation: "none",
  },
})

function Surface({
  className,
  variant,
  elevation,
  ...props
}: ComponentPropsWithoutRef<"div"> & VariantProps<typeof surfaceVariants>) {
  return (
    <div
      data-slot="surface"
      className={cn(surfaceVariants({ variant, elevation, className }))}
      {...props}
    />
  )
}

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-caption-bold",
  {
    variants: {
      variant: {
        purple: "bg-primary text-primary-foreground",
        pink: "bg-brand-pink text-primary-foreground",
        orange: "bg-brand-orange text-primary-foreground",
        popular: "bg-primary text-primary-foreground",
        "tag-purple":
          "rounded-sm bg-tint-lavender px-2 py-0.5 text-brand-purple-800",
        "tag-orange":
          "rounded-sm bg-tint-peach px-2 py-0.5 text-[var(--brand-orange-deep)]",
        "tag-green": "rounded-sm bg-tint-mint px-2 py-0.5 text-charcoal",
      },
    },
    defaultVariants: {
      variant: "purple",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, Surface, badgeVariants, surfaceVariants }
