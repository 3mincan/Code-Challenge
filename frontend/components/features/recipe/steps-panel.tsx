"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Check, ChevronRight, Clock3, Undo2 } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { motionEasings, springTactile } from "@/components/ui/motion"
import { Text } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { RecipeStep } from "@/types/recipe"

import { formatMinutes } from "./recipe-utils"

const swipePx = 56

type ImmersiveStepStackProps = {
  currentStepIndex: number
  steps: RecipeStep[]
  onStepChange: (index: number) => void
  /** Tighter vertical rhythm when nested inside the cooking control card. */
  embedded?: boolean
}

/**
 * Cooking mode: vertical rhythm — earlier step above (faded), current centred and large,
 * next step below (faded). Swipe up → next, swipe down → previous (matches the stack).
 */
function ImmersiveStepStack({
  currentStepIndex,
  steps,
  onStepChange,
  embedded = false,
}: ImmersiveStepStackProps) {
  const swipeStartY = useRef<number | null>(null)
  const cur = steps[currentStepIndex]
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1]! : null
  const nextStep =
    currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1]! : null

  if (!cur) {
    return null
  }

  const previewClass =
    "motion-standard w-full max-w-xl px-3 text-center text-body-sm leading-snug text-ink transition-opacity duration-300"

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col items-center gap-1 px-1 sm:gap-2",
        embedded ? "py-2 sm:py-3" : "py-4 sm:py-6"
      )}
    >
      <div className="flex min-h-[2.75rem] w-full max-w-xl items-end justify-center sm:min-h-[3.25rem]">
        {prevStep ? (
          <motion.button
            key={`prev-${prevStep.step_number}`}
            type="button"
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.34, y: 0, scale: 0.97 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: motionEasings.emphasized }}
            className={cn(
              previewClass,
              "line-clamp-2 cursor-pointer touch-manipulation opacity-[0.34]",
              "hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            )}
            onClick={() => onStepChange(currentStepIndex - 1)}
            aria-label={`Previous step: ${prevStep.instruction.slice(0, 80)}`}
          >
            {prevStep.instruction}
          </motion.button>
        ) : (
          <div className="min-h-[0.5rem] w-full" aria-hidden />
        )}
      </div>

      <div
        className="relative w-full max-w-xl touch-pan-y px-2 py-3 sm:px-4 sm:py-5"
        onPointerDown={(e) => {
          swipeStartY.current = e.clientY
        }}
        onPointerUp={(e) => {
          if (swipeStartY.current == null) {
            return
          }
          const dy = e.clientY - swipeStartY.current
          swipeStartY.current = null
          if (dy < -swipePx) {
            onStepChange(Math.min(currentStepIndex + 1, steps.length - 1))
          } else if (dy > swipePx) {
            onStepChange(Math.max(currentStepIndex - 1, 0))
          }
        }}
        onPointerCancel={() => {
          swipeStartY.current = null
        }}
      >
        <motion.div
          key={`${currentStepIndex}-${cur.step_number}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: motionEasings.emphasized }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <Text
            as="p"
            variant="h3"
            measure="none"
            className="max-w-[22rem] text-balance text-[clamp(1.35rem,5.2vw,2.05rem)] font-semibold leading-snug tracking-tight text-ink sm:max-w-none"
          >
            {cur.instruction}
          </Text>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {cur.duration_minutes ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-body-sm-medium text-slate shadow-elevation-1 ring-1 ring-hairline-soft/80">
                <Clock3 className="size-4 shrink-0" aria-hidden />
                {formatMinutes(cur.duration_minutes)}
              </span>
            ) : null}
            {cur.requires_attention ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-tint-rose px-3 text-body-sm-medium text-ink">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                Stay close
              </span>
            ) : null}
          </div>

          {cur.tips.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: motionEasings.emphasized }}
              className="w-full rounded-xl bg-canvas/90 p-3 text-left ring-1 ring-hairline-soft sm:p-4"
            >
              <Text variant="small-medium" measure="none">
                Tips
              </Text>
              <ul className="mt-2 list-inside list-disc space-y-1.5 marker:text-slate">
                {cur.tips.map((tip) => (
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
        </motion.div>
      </div>

      <div className="flex min-h-[2.75rem] w-full max-w-xl items-start justify-center sm:min-h-[3.25rem]">
        {nextStep ? (
          <motion.button
            key={`next-${nextStep.step_number}`}
            type="button"
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 0.38, y: 0, scale: 0.97 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: motionEasings.emphasized }}
            className={cn(
              previewClass,
              "line-clamp-2 cursor-pointer touch-manipulation opacity-[0.38]",
              "hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            )}
            onClick={() => onStepChange(currentStepIndex + 1)}
            aria-label={`Next step: ${nextStep.instruction.slice(0, 80)}`}
          >
            {nextStep.instruction}
          </motion.button>
        ) : (
          <div className="min-h-[0.5rem] w-full" aria-hidden />
        )}
      </div>
    </div>
  )
}

type StepsPanelProps = {
  currentStepIndex: number
  steps: RecipeStep[]
  /** Wider rhythm and stronger focus on the active step (cooking mode). */
  immersive?: boolean
  /**
   * Nested inside parent `Cooking mode controls` — no outer section landmark or card chrome.
   */
  embedded?: boolean
  /** Agent mutating recipe/progress — light frame emphasis on the panel. */
  agentBusy?: boolean
  /** Cooking-mode navigation: updates authoritative `current_step` via coagent. */
  onStepChange?: (index: number) => void
}

function StepsPanel({
  currentStepIndex,
  steps,
  immersive = false,
  embedded = false,
  agentBusy = false,
  onStepChange,
}: StepsPanelProps) {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    stepRefs.current.length = steps.length
  }, [steps.length])

  useEffect(() => {
    if (immersive) {
      return
    }
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

  const embeddedImmersive = embedded && immersive

  const inner = (
    <>
      <h2 className="sr-only">Cooking steps</h2>

      <div
        className={cn(
          !embeddedImmersive && "mb-6",
          immersive ? "space-y-3" : "space-y-2.5"
        )}
      >
        {!immersive ? (
          <div className="flex items-center justify-between gap-3 pb-2.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text variant="caption" measure="none" tone="muted">
                Method
              </Text>
              <Text as="h2" variant="h3" measure="none">
                Steps
              </Text>
            </div>
            {onStepChange && steps.length > 0 ? (
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-12 shrink-0 touch-manipulation gap-1.5 md:min-h-11"
                  disabled={currentStepIndex <= 0}
                  onClick={() => onStepChange(currentStepIndex - 1)}
                  aria-label={
                    currentStepIndex <= 0
                      ? "Already on the first step"
                      : "Go to the previous step"
                  }
                >
                  <Undo2 className="size-4" strokeWidth={2} aria-hidden />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-12 shrink-0 touch-manipulation gap-1.5 md:min-h-11"
                  disabled={currentStepIndex >= steps.length - 1}
                  onClick={() => onStepChange(currentStepIndex + 1)}
                  aria-label={
                    currentStepIndex >= steps.length - 1
                      ? "No further steps"
                      : "Go to the next step"
                  }
                >
                  Onward
                  <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {immersive && !embedded ? (
        <div
          className="flex gap-1.5 sm:gap-2"
          role="list"
          aria-label="Progress by step"
        >
            {steps.map((step, index) => {
              const done = index < currentStepIndex
              const current = index === currentStepIndex
              const jumpable = Boolean(onStepChange)

              return (
                <motion.button
                  key={step.step_number}
                  layout
                  type="button"
                  role="listitem"
                  aria-label={
                    jumpable
                      ? `Step ${step.step_number}${
                          current ? ", current" : done ? ", completed" : ""
                        }`
                      : `Step ${step.step_number} indicator`
                  }
                  aria-current={current ? "step" : undefined}
                  disabled={!jumpable}
                  onClick={
                    jumpable ? () => onStepChange?.(index) : undefined
                  }
                  className={cn(
                    "group relative flex min-h-12 min-w-8 flex-1 touch-manipulation items-center justify-center rounded-full sm:min-h-11",
                    !jumpable && "pointer-events-none",
                    jumpable && "cursor-pointer",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                  )}
                  initial={false}
                  animate={{
                    scale: current ? (immersive ? 1.08 : 1.04) : 1,
                    opacity: current ? 1 : done ? 0.92 : 0.65,
                  }}
                  transition={{ duration: 0.35, ease: motionEasings.emphasized }}
                >
                  <span
                    className={cn(
                      "pointer-events-none h-2.5 w-full max-h-2.5 rounded-full transition-colors",
                      done && "bg-brand-green",
                      current && !done && "bg-primary",
                      !done && !current && "bg-hairline-soft"
                    )}
                    aria-hidden
                  />
                </motion.button>
              )
            })}
        </div>
        ) : null}
      </div>

      {immersive && onStepChange ? (
        <ImmersiveStepStack
          currentStepIndex={currentStepIndex}
          steps={steps}
          onStepChange={onStepChange}
          embedded={embeddedImmersive}
        />
      ) : null}

      {!(immersive && onStepChange) ? (
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
              "hover:border-hairline-strong hover:bg-surface-soft/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          )

          const badgeClass = cn(
            "flex shrink-0 items-center justify-center rounded-xl text-body-md-medium motion-standard transition-colors duration-300",
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
                layout: { duration: 0.32, ease: motionEasings.emphasized },
                delay: immersive ? 0 : index * 0.02,
                duration: immersive ? 0.34 : 0.28,
                ease: motionEasings.emphasized,
                  opacity: { duration: 0.35, ease: motionEasings.emphasized },
                  scale: { duration: 0.35, ease: motionEasings.emphasized },
              }}
              className={cn(shellClass, "relative")}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={
                immersive && onStepChange && !isCurrent
                  ? `Go to step ${step.step_number}`
                  : undefined
              }
              tabIndex={
                immersive && onStepChange && !isCurrent ? 0 : undefined
              }
              onKeyDown={
                immersive && onStepChange && !isCurrent
                  ? (e) => {
                      if (e.key !== "Enter" && e.key !== " ") {
                        return
                      }
                      e.preventDefault()
                      onStepChange(index)
                    }
                  : undefined
              }
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
                )}
              >
                <span className={badgeClass} aria-hidden>
                  <AnimatePresence initial={false} mode="popLayout">
                    {isCompleted && !isCurrent ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.72, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.72, opacity: 0 }}
                        transition={springTactile}
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
                        ease: motionEasings.emphasized,
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
                      transition={{ duration: 0.28, ease: motionEasings.emphasized }}
                      className="rounded-xl bg-canvas/90 p-3 ring-1 ring-hairline-soft sm:p-4"
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
      ) : null}
    </>
  )

  if (embeddedImmersive) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.06,
          duration: 0.32,
          ease: motionEasings.emphasized,
        }}
        className={cn(
          "transition-[box-shadow] duration-300",
          agentBusy && "rounded-2xl ring-1 ring-primary/20"
        )}
      >
        {inner}
      </motion.div>
    )
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.36, ease: motionEasings.emphasized }}
      className={cn(
        "rounded-xl border border-hairline bg-canvas p-5 shadow-elevation-1 sm:p-6",
        immersive &&
          "rounded-3xl border-hairline/70 bg-canvas/85 px-4 py-5 shadow-elevation-1 backdrop-blur-sm sm:px-5 sm:py-7",
        "transition-[box-shadow,ring] duration-300",
        agentBusy && "ring-1 ring-primary/20 shadow-elevation-2"
      )}
      aria-label="Cooking steps"
    >
      {inner}
    </motion.section>
  )
}

export { StepsPanel }
