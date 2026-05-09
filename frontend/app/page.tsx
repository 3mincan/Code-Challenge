import { ArrowRight, Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Cluster, Container, Section, Stack } from "@/components/ui/section"
import { Badge, Surface } from "@/components/ui/surface"
import { Eyebrow, Text } from "@/components/ui/typography"

const colourTokens = [
  ["Primary", "bg-primary"],
  ["Navy", "bg-brand-navy"],
  ["Peach", "bg-tint-peach"],
  ["Rose", "bg-tint-rose"],
  ["Mint", "bg-tint-mint"],
  ["Sky", "bg-tint-sky"],
  ["Yellow", "bg-tint-yellow-bold"],
  ["Ink", "bg-ink"],
]

const spacingTokens = [
  ["xxs", "4px"],
  ["xs", "8px"],
  ["sm", "12px"],
  ["md", "16px"],
  ["lg", "24px"],
  ["xl", "32px"],
  ["section", "64px"],
  ["hero", "120px"],
]

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      <Section spacing="hero" tone="navy">
        <Container>
          <Stack className="items-center gap-8 text-center">
            <Badge variant="tag-purple">Phase 0 foundation</Badge>
            <Stack className="items-center gap-5">
              <Text as="h1" variant="hero" tone="inverse" measure="xl">
                A calmer system for recipe work.
              </Text>
              <Text variant="subtitle" tone="inverse-muted" measure="lg">
                Editorial type, warm surfaces, tactile controls, and tablet-first
                layout rules are in place before feature work begins.
              </Text>
            </Stack>
            <Cluster className="justify-center">
              <Button variant="primary">
                Start with a recipe
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button variant="secondary-on-dark">Review tokens</Button>
            </Cluster>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Stack className="gap-5">
              <Eyebrow>Typography</Eyebrow>
              <Text as="h2" variant="display" measure="lg">
                Built for long reading, quick scanning, and quiet confidence.
              </Text>
              <Text measure="lg">
                The scale keeps display moments expressive while body text stays
                generous and readable for recipe instructions, ingredient notes,
                and assistant responses.
              </Text>
            </Stack>
            <Stack className="gap-4">
              <Surface variant="base">
                <Text as="h3" variant="h3" measure="none">
                  Heading three, 28 / 1.25
                </Text>
                <Text className="mt-3" measure="none">
                  Body copy uses a 1.55 line-height so preparation steps have
                  enough air without feeling sparse.
                </Text>
              </Surface>
              <Surface variant="cream">
                <Cluster className="justify-between gap-4">
                  <Text as="h4" variant="h4" measure="none">
                    Touch targets
                  </Text>
                  <Button size="icon-sm" variant="ghost" aria-label="Example">
                    <Check />
                  </Button>
                </Cluster>
              </Surface>
            </Stack>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" tone="soft">
        <Container>
          <Stack className="gap-8">
            <Stack className="gap-3">
              <Eyebrow>Tokens</Eyebrow>
              <Text as="h2" variant="h2">
                Colour, spacing, elevation, and motion foundations.
              </Text>
            </Stack>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {colourTokens.map(([label, className]) => (
                <Surface key={label} variant="base" className="p-4">
                  <div className={`${className} h-20 rounded-lg`} />
                  <Text className="mt-4" variant="small-medium" measure="none">
                    {label}
                  </Text>
                </Surface>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {spacingTokens.map(([label, value]) => (
                <Surface key={label} variant="feature" className="p-5">
                  <Text variant="caption" measure="none">
                    {label}
                  </Text>
                  <Text as="p" variant="h4" measure="none">
                    {value}
                  </Text>
                </Surface>
              ))}
            </div>
          </Stack>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Surface variant="yellow-bold">
              <Sparkles className="mb-8 size-6" />
              <Text as="h3" variant="h3" measure="none">
                Premium, not loud.
              </Text>
              <Text className="mt-3" measure="none">
                Tinted panels carry emphasis, while the core interface stays
                restrained and legible.
              </Text>
            </Surface>
            <Surface variant="peach">
              <Text as="h3" variant="h4" measure="none">
                Button primitives
              </Text>
              <Cluster className="mt-6">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </Cluster>
            </Surface>
            <Surface variant="mint">
              <Text as="h3" variant="h4" measure="none">
                Motion rules
              </Text>
              <Text className="mt-3" measure="none">
                Fast, tactile transitions use 120-260ms timings and respect
                reduced-motion preferences globally.
              </Text>
            </Surface>
          </div>
        </Container>
      </Section>
    </main>
  )
}
