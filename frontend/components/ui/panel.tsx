import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

import { Surface } from "./surface"

function Panel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Surface>) {
  return <Surface variant="recipe" className={cn(className)} {...props} />
}

export { Panel }
