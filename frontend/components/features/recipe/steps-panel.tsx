"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, Clock3 } from "lucide-react"
import { useEffect, useRef } from "react"

import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { RecipeStep } from "@/types/recipe"

import { formatMinutes } from "./recipe-utils"

const stepEase = [0.16, 1, 0.3, 1] as const

type StepsPanelProps = {
  currentStepIndex: number
  steps: RecipeStep[]
  /** Wider rhythm and stronger focus on the active step (cooking mode). */
  immersive?: boolean
}

function StepsPanel({
  currentStepIndex,
  steps,
  immersive = false,
}: StepsPanelProps) {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    stepRefs.current.length = steps.length
  }, [steps.length])

  useEffect(() => {
    const node = stepRefs.current[currentStepIndex]
    if (!node) {
      return
    }

    const id = window.requestAnimationFrame(() => {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })
    })

    return () => window.cancelAnimationFrame(id)
  }, [currentStepIndex, steps.length])

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.36, ease: stepEase }}
      className={cn(
        "rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6",
        immersive && "shadow-elevation-2"
      )}
      aria-label="Cooking steps"
    >
      <div className="mb-6 space-y-4">
        <div>
          <Text variant="caption" measure="none">
            Method
          </Text>
          <Text as="h2" variant="h3" measure="none">
            Steps
          </Text>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Text variant="small-medium" tone="muted" measure="none">
              {currentStepIndex + 1} of {steps.length}
            </Text>
            <Text variant="small" tone="muted" measure="none">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% through
            </Text>
          </div>
          <div
            className="flex gap-1"
            role="list"
            aria-label="Progress by step"
          >
            {steps.map((step, index) => {
              const done = index < currentStepIndex
              const current = index === currentStepIndex
              return (
                <motion.div
                  key={step.step_number}
                  layout
                  role="listitem"
                  title={`Step ${step.step_number}`}
                  className={cn(
                    "h-1.5 min-w-6 flex-1 rounded-full transition-colors",
                    done && "bg-brand-green",
                    current && !done && "bg-primary",
                    !done && !current && "bg-hairline-soft"
                  )}
                  initial={false}
                  animate={{
                    scale: current ? 1.04 : 1,
                    opacity: current ? 1 : done ? 0.92 : 0.65,
                  }}
                  transition={{ duration: 0.35, ease: stepEase }}
                />
              )
            })}
          </div>
        </div>
      </div>

      <motion.ol layout className="space-y-3 sm:space-y-4">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          const isUpcoming = index > currentStepIndex

          const shellClass = cn(
            "rounded-xl border p-4 sm:p-5 transition-[border-color,box-shadow,background-color] duration-300",
            isCurrent &&
              "border-primary bg-tint-yellow shadow-elevation-2 ring-1 ring-primary/15",
            isCompleted &&
              !isCurrent &&
              "border-hairline bg-surface-soft/80 shadow-elevation-1",
            isUpcoming && "border-hairline-soft bg-surface-soft/40"
          )

          const badgeClass = cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg text-body-md-medium motion-standard transition-colors duration-300 sm:size-12",
            isCurrent &&
              "bg-primary text-primary-foreground shadow-elevation-1",
            isCompleted &&
              !isCurrent &&
              "bg-brand-green text-on-dark",
            isUpcoming && "border border-hairline-strong bg-canvas text-slate"
          )

          return (
            <motion.li
              layout
              key={`${step.step_number}-${index}`}
              ref={(el) => {
                stepRefs.current[index] = el
              }}
              data-step-index={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.28, ease: stepEase }}
              className={shellClass}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className={badgeClass} aria-hidden>
                  <AnimatePresence initial={false} mode="popLayout">
                    {isCompleted && !isCurrent ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.72, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.72, opacity: 0 }}
                        transition={{ duration: 0.22, ease: stepEase }}
                      >
                        <Check className="size-5 sm:size-5" strokeWidth={2.5} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step.step_number}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>

                <div className="min-w-0 flex-1 space-y-3">
                  <Text
                    as="p"
                    variant={
                      isCurrent
                        ? immersive
                          ? "h4"
                          : "body-medium"
                        : "body"
                    }
                    measure="none"
                    className={cn(
                      isCompleted && "text-slate line-through decoration-hairline-strong/80",
                      isUpcoming && "text-charcoal"
                    )}
                  >
                    {step.instruction}
                  </Text>

                  <div className="flex flex-wrap gap-2">
                    {step.duration_minutes ? (
                      <span
                        className={cn(
                          "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-body-sm-medium",
                          isCurrent
                            ? "bg-canvas text-slate"
                            : "bg-canvas text-slate/90"
                        )}
                      >
                        <Clock3 className="size-4 shrink-0" aria-hidden />
                        {formatMinutes(step.duration_minutes)}
                      </span>
                    ) : null}
                    {step.requires_attention ? (
                      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-tint-rose px-3 text-body-sm-medium text-ink">
                        <AlertCircle className="size-4 shrink-0" aria-hidden />
                        Stay close
                      </span>
                    ) : null}
                    {isCompleted ? (
                      <span className="inline-flex min-h-8 items-center rounded-full bg-tint-mint/90 px-3 text-body-sm-medium text-ink">
                        Done
                      </span>
                    ) : null}
                    {isUpcoming && index === currentStepIndex + 1 ? (
                      <span className="inline-flex min-h-8 items-center rounded-full border border-hairline bg-canvas px-3 text-body-sm-medium text-slate">
                        Up next
                      </span>
                    ) : null}
                  </div>

                  {step.tips.length > 0 && isCurrent ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: stepEase }}
                      className="rounded-lg bg-canvas/90 p-3 ring-1 ring-hairline-soft"
                    >
                      <Text variant="small-medium" measure="none">
                        Tips
                      </Text>
                      <ul className="mt-2 list-inside list-disc space-y-1.5 marker:text-slate">
                        {step.tips.map((tip) => (
                          <li key={tip}>
                            <Text
                              as="span"
                              variant="small"
                              tone="muted"
                              measure="none"
                            >
                              {tip}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            </motion.li>
          )
        })}
      </motion.ol>
    </motion.section>
  )
}

export { StepsPanel }
