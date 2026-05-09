"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, Clock3 } from "lucide-react"
import { useEffect, useRef } from "react"

import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { RecipeStep } from "@/types/recipe"

import { formatMinutes } from "./recipe-utils"

const stepEase = [0.16, 1, 0.3, 1] as const
const swipePx = 56

type StepsPanelProps = {
  currentStepIndex: number
  steps: RecipeStep[]
  /** Wider rhythm and stronger focus on the active step (cooking mode). */
  immersive?: boolean
  /** Agent mutating recipe/progress — light frame emphasis on the panel. */
  agentBusy?: boolean
  /** Cooking-mode navigation: updates authoritative `current_step` via coagent. */
  onStepChange?: (index: number) => void
}

function StepsPanel({
  currentStepIndex,
  steps,
  immersive = false,
  agentBusy = false,
  onStepChange,
}: StepsPanelProps) {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const swipeStartX = useRef<number | null>(null)

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
        block: immersive ? "start" : "center",
        inline: "nearest",
      })
    })

    return () => window.cancelAnimationFrame(id)
  }, [currentStepIndex, steps.length, immersive])

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.36, ease: stepEase }}
      className={cn(
        "rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6",
        immersive &&
          "rounded-3xl border-hairline/70 bg-canvas/85 px-4 py-5 shadow-elevation-1 backdrop-blur-sm sm:px-5 sm:py-7",
        "transition-[box-shadow,ring] duration-300",
        agentBusy && "ring-1 ring-primary/20 shadow-elevation-2"
      )}
      aria-label="Cooking steps"
    >
      <h2 className="sr-only">Cooking steps</h2>

      <div
        className={cn(
          "mb-6 space-y-4",
          immersive && "mb-5 space-y-3"
        )}
      >
        {!immersive ? (
          <div>
            <Text variant="caption" measure="none">
              Method
            </Text>
            <Text as="h2" variant="h3" measure="none">
              Steps
            </Text>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Text variant="small-medium" tone="muted" measure="none">
              {currentStepIndex + 1} of {steps.length}
            </Text>
            <Text variant="small" tone="muted" measure="none">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              {" through"}
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
              const jumpable = Boolean(immersive && onStepChange)

              return (
                <motion.button
                  key={step.step_number}
                  layout
                  type="button"
                  role="listitem"
                  title={
                    jumpable ? `Go to step ${step.step_number}` : undefined
                  }
                  disabled={!jumpable}
                  onClick={
                    jumpable ? () => onStepChange?.(index) : undefined
                  }
                  className={cn(
                    "h-2 min-h-8 min-w-6 flex-1 rounded-full transition-colors",
                    !jumpable && "pointer-events-none",
                    jumpable && "cursor-pointer touch-manipulation",
                    done && "bg-brand-green",
                    current && !done && "bg-primary",
                    !done && !current && "bg-hairline-soft"
                  )}
                  initial={false}
                  animate={{
                    scale: current ? (immersive ? 1.08 : 1.04) : 1,
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
            "rounded-xl border transition-[border-color,box-shadow,background-color,opacity,transform,padding] duration-300",
            immersive && isCurrent && "px-5 py-7 sm:px-10 sm:py-10",
            immersive && !isCurrent && "px-3 py-3 sm:px-4 sm:py-4",
            !immersive && "p-4 sm:p-5",
            isCurrent &&
              "border-primary bg-tint-yellow shadow-elevation-2",
            isCompleted &&
              !isCurrent &&
              "border-hairline bg-surface-soft/80 shadow-elevation-1",
            isUpcoming && "border-hairline-soft bg-surface-soft/40",
            immersive &&
              !isCurrent &&
              "pointer-events-auto cursor-pointer select-none",
            immersive &&
              onStepChange &&
              !isCurrent &&
              "hover:border-hairline-strong hover:bg-surface-soft/90"
          )

          const badgeClass = cn(
            "flex shrink-0 items-center justify-center rounded-lg text-body-md-medium motion-standard transition-colors duration-300",
            immersive && isCurrent
              ? "size-12 text-xl font-semibold sm:size-14 sm:text-2xl"
              : "size-11 sm:size-12",
            isCurrent &&
              "bg-primary text-primary-foreground shadow-elevation-1",
            isCompleted &&
              !isCurrent &&
              "bg-brand-green text-on-dark",
            isUpcoming && "border border-hairline-strong bg-canvas text-slate"
          )

          return (
            <motion.li
              layout="position"
              key={step.step_number}
              ref={(el) => {
                stepRefs.current[index] = el
              }}
              data-step-index={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity:
                  immersive && !isCurrent ? (isCompleted ? 0.4 : 0.36) : 1,
                scale: immersive && !isCurrent ? 0.985 : 1,
                y: 0,
              }}
              transition={{
                layout: { duration: 0.32, ease: stepEase },
                delay: immersive ? 0 : index * 0.02,
                duration: immersive ? 0.34 : 0.28,
                ease: stepEase,
                  opacity: { duration: 0.35, ease: stepEase },
                  scale: { duration: 0.35, ease: stepEase },
              }}
              className={cn(shellClass, "relative")}
              aria-current={isCurrent ? "step" : undefined}
              onClick={
                immersive && onStepChange && !isCurrent
                  ? () => onStepChange(index)
                  : undefined
              }
            >
              {isCurrent ? (
                <motion.div
                  layoutId="chef-active-step-shell"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/20 sm:rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <div
                className={cn(
                  "relative flex items-start gap-3 sm:gap-4",
                  immersive &&
                    isCurrent &&
                    onStepChange &&
                    "touch-pan-y"
                )}
                onPointerDown={
                  immersive && isCurrent && onStepChange
                    ? (e) => {
                        swipeStartX.current = e.clientX
                      }
                    : undefined
                }
                onPointerUp={
                  immersive && isCurrent && onStepChange
                    ? (e) => {
                        if (swipeStartX.current == null) {
                          return
                        }
                        const dx = e.clientX - swipeStartX.current
                        swipeStartX.current = null
                        if (dx < -swipePx) {
                          onStepChange(
                            Math.min(currentStepIndex + 1, steps.length - 1)
                          )
                        } else if (dx > swipePx) {
                          onStepChange(Math.max(currentStepIndex - 1, 0))
                        }
                      }
                    : undefined
                }
                onPointerCancel={() => {
                  swipeStartX.current = null
                }}
              >
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
                        <Check className="size-5 sm:size-6" strokeWidth={2.5} />
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
                  <AnimatePresence initial={false} mode="wait">
                    <motion.div
                      key={
                        isCurrent
                          ? `${currentStepIndex}-${step.instruction.slice(0, 24)}`
                          : step.instruction
                      }
                      initial={{
                        opacity: immersive && isCurrent ? 0 : 0.82,
                        y: immersive && isCurrent ? 10 : 0,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: immersive && isCurrent ? -8 : 0,
                      }}
                      transition={{
                        duration: immersive && isCurrent ? 0.32 : 0.28,
                        ease: stepEase,
                      }}
                    >
                      <Text
                        as="p"
                        variant={
                          isCurrent
                            ? immersive
                              ? "h2"
                              : "body-medium"
                            : "body"
                        }
                        measure="none"
                        className={cn(
                          immersive && isCurrent && "max-w-none text-balance",
                          immersive &&
                            isCurrent &&
                            "text-[clamp(1.2rem,3.8vw,1.65rem)] font-semibold leading-snug tracking-tight text-ink",
                          isCompleted &&
                            "text-slate line-through decoration-hairline-strong/80",
                          isUpcoming && "text-charcoal"
                        )}
                      >
                        {step.instruction}
                      </Text>
                    </motion.div>
                  </AnimatePresence>

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
                      className="rounded-lg bg-canvas/90 p-3 ring-1 ring-hairline-soft sm:p-4"
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
