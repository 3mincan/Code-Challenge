import { HttpAgent } from "@ag-ui/client"
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime"
import type { NextRequest } from "next/server"

import { RECIPE_AGENT_NAME } from "@/config/copilot"

/**
 * Backend URL seen from **this Next.js Node process** (Route Handler).
 * In Docker Compose / Dokploy, `localhost` is the frontend container alone, so use
 * the internal service hostname (for example `http://recipe-api:8000`).
 * Browser calls still use `NEXT_PUBLIC_API_BASE_URL` via `lib/api/client.ts`.
 */
function backendBaseForServerProxy(): string {
  const raw =
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  try {
    return new URL(raw).toString().replace(/\/+$/, "")
  } catch {
    throw new Error(
      "API_INTERNAL_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be an absolute URL, for example http://recipe-api:8000"
    )
  }
}

const runtime = new CopilotRuntime({
  agents: {
    [RECIPE_AGENT_NAME]: new HttpAgent({
      agentId: RECIPE_AGENT_NAME,
      url: `${backendBaseForServerProxy()}/copilotkit`,
    }),
  },
})

const handler = copilotRuntimeNextJSAppRouterEndpoint({
  endpoint: "/api/copilotkit",
  runtime,
})

export const GET = (request: NextRequest) => handler.handleRequest(request)
export const POST = (request: NextRequest) => handler.handleRequest(request)
