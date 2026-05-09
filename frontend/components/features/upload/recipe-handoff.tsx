"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Clock, ListChecks, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Cluster, Stack } from "@/components/ui/section"
import { Surface } from "@/components/ui/surface"
import { Text } from "@/components/ui/typography"
import type { UploadRecipeResponse } from "@/types/recipe"

type RecipeHandoffProps = {
  response: UploadRecipeResponse
  onReset: () => void
}

function formatMinutes(value: number | null) {
  if (!value) {
    return "Flexible"
  }

  return `${value} min`
}

function RecipeHandoff({ response, onReset }: RecipeHandoffProps) {
  const recipe = response.state.recipe

  if (!recipe) {
    return null
  }

  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      <Surface variant="base" elevation="card" className="space-y-8 p-6 sm:p-8">
        <Cluster className="justify-between gap-4">
          <Cluster className="gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-tint-mint text-brand-green">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <Text variant="caption" measure="none">
                Recipe ready
              </Text>
              <Text as="h2" variant="h3" measure="none">
                {recipe.title}
              </Text>
            </div>
          </Cluster>
          <Button variant="ghost" onClick={onReset}>
            Upload another
          </Button>
        </Cluster>

        {recipe.description ? (
          <Text variant="subtitle" measure="lg">
            {recipe.description}
          </Text>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-tint-cream p-4 text-charcoal">
            <UsersRound className="mb-5 size-5 text-brand-purple" />
            <Text variant="caption" measure="none">
              Servings
            </Text>
            <Text variant="h4" measure="none">
              {recipe.servings}
            </Text>
          </div>
          <div className="rounded-lg bg-tint-sky p-4 text-charcoal">
            <Clock className="mb-5 size-5 text-link-blue" />
            <Text variant="caption" measure="none">
              Total time
            </Text>
            <Text variant="h4" measure="none">
              {formatMinutes(totalTime)}
            </Text>
          </div>
          <div className="rounded-lg bg-tint-lavender p-4 text-charcoal">
            <CheckCircle2 className="mb-5 size-5 text-brand-purple" />
            <Text variant="caption" measure="none">
              Parsed
            </Text>
            <Text variant="h4" measure="none">
              {recipe.ingredients.length} ingredients
            </Text>
          </div>
        </div>

        <Stack className="gap-3">
          <Text variant="caption" measure="none">
            Cooking workspace
          </Text>
          <Text measure="lg">
            Your recipe is structured and ready to guide. Start with the
            ingredients, then move through each step at a calm pace.
          </Text>
        </Stack>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            document
              .getElementById("recipe-steps-preview")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
        >
          <ListChecks data-icon="inline-start" />
          View cooking steps
        </Button>

        <div id="recipe-steps-preview" className="space-y-3 scroll-mt-8">
          {recipe.steps.slice(0, 3).map((step) => (
            <div
              key={step.step_number}
              className="rounded-lg border border-hairline bg-surface-soft p-4"
            >
              <Text variant="caption" measure="none">
                Step {step.step_number}
              </Text>
              <Text className="mt-2" measure="none">
                {step.instruction}
              </Text>
            </div>
          ))}
        </div>
      </Surface>
    </motion.div>
  )
}

export { RecipeHandoff }
