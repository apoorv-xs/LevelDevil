import { config } from "./config.js";
import { ApiError } from "./errors.js";
export async function qualify(input) {
  const mode = process.env.AI_MODE || config.aiMode;
  if (mode === "mock") return { score: 0.75, category: "warm", rationale: "Synthetic qualification result" };
  if (mode !== "proxy") throw new ApiError(503, "ai_disabled", "AI qualification is disabled");
  if (!config.aiEndpoint || !config.aiApiKey) throw new ApiError(503, "ai_not_configured", "AI proxy is not configured");
  const result = await fetch(config.aiEndpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${config.aiApiKey}` }, body: JSON.stringify(input) });
  if (!result.ok) throw new ApiError(502, "ai_upstream_error", "AI provider request failed");
  return result.json();
}
