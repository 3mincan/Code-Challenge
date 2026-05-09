import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function AppShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-canvas", className)}>
      {children}
    </div>
  )
}

function ShellMain({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main className={cn("flex-1", className)} data-slot="shell-main">
      {children}
    </main>
  )
}

export { AppShell, ShellMain }
