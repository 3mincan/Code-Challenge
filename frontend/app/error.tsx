"use client"

import { useEffect } from "react"

import { AppShell, ShellMain } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Container, Section } from "@/components/ui/section"
import { Text } from "@/components/ui/typography"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <AppShell>
      <ShellMain>
        <Section spacing="hero">
          <Container className="max-w-md">
            <Text as="h1" variant="h2" measure="none">
              Something got tangled
            </Text>
            <Text variant="body" measure="none" tone="muted" className="mt-3">
              This screen hit an unexpected problem. Your recipe file in memory
              is unchanged; try again or refresh the page.
            </Text>
            <Button type="button" className="mt-8" onClick={reset}>
              Try again
            </Button>
          </Container>
        </Section>
      </ShellMain>
    </AppShell>
  )
}
