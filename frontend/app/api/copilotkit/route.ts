import { HttpAgent } from "@ag-ui/client"
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime"
import type { NextRequest } from "next/server"

import { RECIPE_AGENT_NAME } from "@/config/copilot"
import { env } from "@/config/env"

const runtime = new CopilotRuntime({
  agents: {
    [RECIPE_AGENT_NAME]: new HttpAgent({
      agentId: RECIPE_AGENT_NAME,
      url: `${env.apiBaseUrl}/copilotkit`,
    }),
  },
})

const handler = copilotRuntimeNextJSAppRouterEndpoint({
  endpoint: "/api/copilotkit",
  runtime,
})

export const GET = (request: NextRequest) => handler.handleRequest(request)
export const POST = (request: NextRequest) => handler.handleRequest(request)
