"use client"

import "@copilotkit/react-core/v2/styles.css"

import {
  CopilotPopup,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2"
import {
  useCopilotChatSuggestions,
  useCopilotReadable,
} from "@copilotkit/react-core"
import { ChefHat, X } from "lucide-react"
import { forwardRef, useMemo } from "react"

import { RECIPE_AGENT_NAME } from "@/config/copilot"
import { cn } from "@/lib/utils"
import type { RecipeContext } from "@/types/recipe"

import { getRecipeChefChatProps } from "./chef-chat-experience"
import { getCurrentStepIndex } from "./recipe-utils"

type RecipeChefAssistantProps = {
  state: RecipeContext
  threadId: string | null
}

const AskChefFab = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function AskChefFab({ className, onClick, ...rest }, ref) {
  const configuration = useCopilotChatConfiguration()
  if (!configuration) {
    return null
  }

  const { isModalOpen, setModalOpen, labels } = configuration

  return (
    <button
      ref={ref}
      type="button"
      data-copilotkit
      data-slot="chat-toggle-button"
      data-state={isModalOpen ? "open" : "closed"}
      aria-label={
        isModalOpen ? labels.chatToggleCloseLabel : labels.chatToggleOpenLabel
      }
      aria-pressed={isModalOpen}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) {
          return
        }
        setModalOpen(!isModalOpen)
      }}
      className={cn(
        "motion-standard fixed z-[1100] flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-full border border-primary bg-primary px-5 text-primary-foreground shadow-elevation-2",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
        "max-w-[calc(100vw-2.5rem)] transition-[transform,box-shadow,opacity] duration-200 ease-out",
        "hover:bg-[var(--primary-pressed)] hover:shadow-elevation-3",
        "active:translate-y-px active:shadow-elevation-1",
        "focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none",
        className
      )}
      {...rest}
    >
      {isModalOpen ? (
        <X className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <>
          <ChefHat className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate text-button-md">Ask Chef</span>
        </>
      )}
    </button>
  )
})
AskChefFab.displayName = "AskChefFab"

function RecipeChefAssistant({ state, threadId }: RecipeChefAssistantProps) {
  const recipe = state.recipe
  const stepIndex = getCurrentStepIndex(state)
  const currentStep = recipe?.steps[stepIndex]

  useCopilotReadable(
    {
      description:
        "What the cook is doing right now in the app — use this for step-specific help.",
      value: recipe
        ? {
            recipe_title: recipe.title,
            current_step_index: state.current_step,
            current_step_number_ui: stepIndex + 1,
            current_step_instruction: currentStep?.instruction ?? null,
            total_steps: recipe.steps.length,
            cooking_started: state.cooking_started,
            scaled_servings: state.scaled_servings,
            servings_shown: recipe.servings,
            ingredient_names: recipe.ingredients.map((ing) => ing.name),
          }
        : null,
      available: recipe ? "enabled" : "disabled",
    },
    [
      recipe,
      state.current_step,
      state.cooking_started,
      state.scaled_servings,
      stepIndex,
      currentStep?.instruction,
    ]
  )

  const suggestionConfig = useMemo(() => {
    if (!recipe) {
      return {
        available: "disabled" as const,
        suggestions: [],
      }
    }

    const targetServings = recipe.servings === 4 ? 6 : 4
    const firstIngredient = recipe.ingredients[0]?.name ?? "an ingredient"

    return {
      available: "always" as const,
      suggestions: [
        {
          title: `Scale to ${targetServings} servings`,
          message: `Scale this recipe to ${targetServings} servings.`,
        },
        {
          title: `Replace ${firstIngredient}`,
          message: `I would like to substitute "${firstIngredient}" with something else that works in this recipe. Suggest a swap and update the recipe.`,
        },
        {
          title: "Explain this step",
          message: currentStep
            ? `Explain step ${stepIndex + 1} in plain language and call out anything easy to get wrong: ${currentStep.instruction}`
            : `Explain the current cooking step in plain language.`,
        },
        {
          title: "Start cooking",
          message:
            "We are ready to cook. Set cooking as started if needed and guide me from the current step.",
        },
      ],
    }
  }, [recipe, currentStep, stepIndex])

  useCopilotChatSuggestions(suggestionConfig, [
    recipe?.title,
    stepIndex,
    currentStep?.instruction,
    recipe?.servings,
    recipe?.ingredients[0]?.name,
  ])

  const chatExperienceProps = useMemo(() => getRecipeChefChatProps(), [])

  if (!recipe || !threadId) {
    return null
  }

  return (
    <CopilotPopup
      {...chatExperienceProps}
      agentId={RECIPE_AGENT_NAME}
      threadId={threadId}
      defaultOpen={false}
      clickOutsideToClose
      width="min(100vw - 2.25rem, 24rem)"
      height="min(70dvh, 32rem)"
      toggleButton={AskChefFab}
      header={{
        title: "Chef",
        className:
          "cpk:border-b cpk:border-border/60 cpk:bg-canvas cpk:px-4 cpk:py-3",
      }}
      labels={{
        modalHeaderTitle: "Chef",
        welcomeMessageText:
          "Quick questions about this recipe — portions, swaps, or the step you are on.",
        chatToggleOpenLabel: "Open Ask Chef",
        chatToggleCloseLabel: "Close Ask Chef",
        chatInputPlaceholder: "Ask about this recipe…",
        chatDisclaimerText:
          "If Chef stops replying, close and reopen the chat. Check that the recipe service is running.",
      }}
    />
  )
}

export { RecipeChefAssistant }
