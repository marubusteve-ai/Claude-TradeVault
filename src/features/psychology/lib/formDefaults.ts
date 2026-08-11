import type { CreatePsychologyEntryInput } from "@trading-os/shared-types";
import { DEMO_USER_ID } from "@/lib/demo-data";

export function getBlankPsychologyFormValues(): CreatePsychologyEntryInput {
  return {
    userId: DEMO_USER_ID,
    date: new Date().toISOString(),
    mood: 5,
    confidence: 5,
    stress: 5,
    discipline: 5,
    patience: 5,
    ruleAdherencePercentage: 80,
    linkedTradeIds: [],
    tags: [],
  };
}
