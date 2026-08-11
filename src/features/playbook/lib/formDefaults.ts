import type { CreateStrategyInput } from "@trading-os/shared-types";
import { DEMO_USER_ID } from "@/lib/demo-data";

export function getBlankStrategyFormValues(): CreateStrategyInput {
  return {
    userId: DEMO_USER_ID,
    name: "",
    assetClasses: [],
    entryRules: [],
    exitRules: [],
    confirmationChecklist: [],
    invalidationRules: [],
    exampleScreenshots: [],
    tags: [],
    isActive: true,
  };
}
