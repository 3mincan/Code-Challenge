import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button motion-standard inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-button-md whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-elevation-1 hover:bg-[var(--primary-pressed)]",
        primary:
          "bg-primary text-primary-foreground shadow-elevation-1 hover:bg-[var(--primary-pressed)]",
        dark: "bg-ink-deep text-on-dark shadow-elevation-1 hover:bg-charcoal",
        outline:
          "border-hairline-strong bg-transparent text-ink hover:bg-surface aria-expanded:bg-surface aria-expanded:text-ink",
        secondary:
          "border-hairline-strong bg-transparent text-ink hover:bg-surface aria-expanded:bg-surface aria-expanded:text-ink",
        "on-dark": "bg-on-dark text-ink shadow-elevation-1 hover:bg-on-dark/90",
        "secondary-on-dark":
          "border-on-dark-muted bg-transparent text-on-dark hover:bg-on-dark/10 aria-expanded:bg-on-dark/10",
        ghost:
          "bg-transparent text-ink hover:bg-surface aria-expanded:bg-surface aria-expanded:text-ink dark:text-on-dark dark:hover:bg-on-dark/10",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "h-auto min-h-0 rounded-none p-0 text-link-blue underline-offset-4 hover:text-[var(--link-blue-pressed)] hover:underline",
      },
      size: {
        default:
          "min-h-10 gap-1.5 px-4 py-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "min-h-8 gap-1 rounded-sm px-2.5 py-1.5 text-caption-bold in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-9 gap-1.5 px-3 py-2 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "min-h-11 gap-2 px-5 py-3 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs":
          "size-8 rounded-sm in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
