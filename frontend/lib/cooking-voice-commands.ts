/**
 * Lightweight routing for hands-free cooking. Local actions avoid a round trip;
 * everything else is sent to the recipe agent verbatim (or with a small prefix).
 */

export type VoiceRouteResult =
  | { kind: "local"; action: "next" | "prev" }
  | { kind: "agent"; message: string }

type RouteContext = {
  currentStepInstruction: string
}

function normaliseUtterance(text: string) {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "")
}

function routeCookingVoiceCommand(
  raw: string,
  ctx: RouteContext
): VoiceRouteResult {
  const t = normaliseUtterance(raw).toLowerCase()

  if (
    /^(next step|next|skip|skip step|forward|go forward|go to next( step)?)$/.test(
      t
    )
  ) {
    return { kind: "local", action: "next" }
  }

  if (
    /^(previous step|go back|back|last step|go to previous( step)?)$/.test(t)
  ) {
    return { kind: "local", action: "prev" }
  }

  if (/^repeat\b|^read (this )?step|^say (it )?again\b/i.test(raw.trim())) {
    return {
      kind: "agent",
      message: `The current step is: "${ctx.currentStepInstruction}". Repeat it slowly and clearly for someone at the hob.`,
    }
  }

  return { kind: "agent", message: raw.trim() }
}

export { routeCookingVoiceCommand }
