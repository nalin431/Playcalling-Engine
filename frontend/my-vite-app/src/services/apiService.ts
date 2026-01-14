import type { GameSituation, BestPlayRecommendation } from "../types";

const API_BASE = "http://localhost:8000";

export async function getBestPlayRecommendation(
  situation: GameSituation
): Promise<BestPlayRecommendation> {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(situation),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recommendation");
  }

  return response.json();
}
