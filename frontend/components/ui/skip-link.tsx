import { cn } from "@/lib/utils"

type SkipLinkProps = {
  href?: string
  children?: string
  className?: string
}

/** First focusable control for keyboard users — jumps to `#main-content`. */
function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "bg-primary text-primary-foreground shadow-elevation-2",
        "fixed left-4 top-4 z-[2000]",
        "inline-flex min-h-12 min-w-[12rem] translate-y-[-120%] items-center justify-center rounded-lg px-4 py-3",
        "text-body-sm-medium no-underline outline-none transition-transform",
        "focus-visible:translate-y-0 focus-visible:ring-3 focus-visible:ring-ring/40",
        className
      )}
    >
      {children}
    </a>
  )
}

export { SkipLink }
