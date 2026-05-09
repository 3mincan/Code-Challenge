"use client"

import { motion } from "framer-motion"
import { AlertCircle, Clock3 } from "lucide-react"

import { Text } from "@/components/ui/typography"
import type { RecipeStep } from "@/types/recipe"

import { formatMinutes } from "./recipe-utils"

type StepsPanelProps = {
  currentStepIndex: number
  steps: RecipeStep[]
}

function StepsPanel({ currentStepIndex, steps }: StepsPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6"
    >
      <div className="mb-6">
        <Text variant="caption" measure="none">
          Method
        </Text>
        <Text as="h2" variant="h3" measure="none">
          Steps
        </Text>
      </div>

      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex
          const isPast = index < currentStepIndex

          return (
            <li
              key={step.step_number}
              className={
                isCurrent
                  ? "rounded-xl border border-primary bg-tint-yellow p-5 shadow-elevation-2"
                  : "rounded-xl border border-hairline bg-surface-soft p-5"
              }
            >
              <div className="flex items-start gap-4">
                <span
                  className={
                    isCurrent
                      ? "flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-body-md-medium text-primary-foreground"
                      : isPast
                        ? "flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-green text-body-md-medium text-on-dark"
                        : "flex size-12 shrink-0 items-center justify-center rounded-lg bg-canvas text-body-md-medium text-slate"
                  }
                >
                  {step.step_number}
                </span>
                <div className="min-w-0 flex-1 space-y-4">
                  <Text
                    variant={isCurrent ? "h4" : "body"}
                    measure="none"
                    className={isPast ? "text-slate" : undefined}
                  >
                    {step.instruction}
                  </Text>

                  <div className="flex flex-wrap gap-2">
                    {step.duration_minutes ? (
                      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-body-sm-medium text-slate">
                        <Clock3 className="size-4" />
                        {formatMinutes(step.duration_minutes)}
                      </span>
                    ) : null}
                    {step.requires_attention ? (
                      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-tint-rose px-3 text-body-sm-medium text-ink">
                        <AlertCircle className="size-4" />
                        Stay close
                      </span>
                    ) : null}
                  </div>

                  {step.tips.length ? (
                    <div className="rounded-lg bg-canvas p-3">
                      <Text variant="small-medium" measure="none">
                        {step.tips[0]}
                      </Text>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </motion.section>
  )
}

export { StepsPanel }
