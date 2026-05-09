import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("max-w-prose", {
  variants: {
    variant: {
      hero: "text-hero-display max-w-5xl text-balance text-ink",
      display: "text-display-lg max-w-4xl text-balance text-ink",
      h1: "text-heading-1 max-w-4xl text-balance text-ink",
      h2: "text-heading-2 max-w-3xl text-balance text-ink",
      h3: "text-heading-3 max-w-2xl text-balance text-ink",
      h4: "text-heading-4 max-w-2xl text-balance text-ink",
      h5: "text-heading-5 max-w-2xl text-ink",
      subtitle: "text-subtitle text-balance text-slate",
      body: "text-body-md text-charcoal",
      "body-medium": "text-body-md-medium text-charcoal",
      small: "text-body-sm text-slate",
      "small-medium": "text-body-sm-medium text-slate",
      caption: "text-caption-bold uppercase text-stone",
      label: "text-body-sm-medium text-ink",
    },
    tone: {
      default: "",
      muted: "text-slate",
      subtle: "text-stone",
      strong: "text-ink-deep",
      inverse: "text-on-dark",
      "inverse-muted": "text-on-dark-muted",
      link: "text-link-blue",
    },
    measure: {
      none: "max-w-none",
      sm: "max-w-sm",
      md: "max-w-prose",
      lg: "max-w-3xl",
      xl: "max-w-5xl",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
    measure: "md",
  },
})

type TextProps<T extends ElementType> = {
  as?: T
} & VariantProps<typeof typographyVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">

function Text<T extends ElementType = "p">({
  as,
  className,
  variant,
  tone,
  measure,
  ...props
}: TextProps<T>) {
  const Comp = as ?? "p"

  return (
    <Comp
      className={cn(typographyVariants({ variant, tone, measure, className }))}
      {...props}
    />
  )
}

const Eyebrow = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) => (
  <p
    className={cn(
      "text-caption-bold max-w-prose text-stone",
      className
    )}
    {...props}
  />
)

export { Eyebrow, Text, typographyVariants }
