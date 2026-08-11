import { AnthropicInsightService, HeuristicInsightService, type AIInsightService } from "@trading-os/ai-services";

export interface InsightServiceResult {
  service: AIInsightService;
  mode: "ai" | "heuristic";
}

/**
 * The single place this app decides which AIInsightService implementation
 * is live. Everything downstream — server actions, UI — depends only on
 * the AIInsightService port and reads `mode` to label the result; nothing
 * else needs to know an API key was or wasn't configured.
 */
export function getInsightService(): InsightServiceResult {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    return { service: new AnthropicInsightService({ apiKey }), mode: "ai" };
  }
  return { service: new HeuristicInsightService(), mode: "heuristic" };
}
