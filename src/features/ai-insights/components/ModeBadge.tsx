import { Sparkles, Calculator } from "lucide-react";
import { Badge } from "@trading-os/design-system";

export function ModeBadge({ mode }: { mode: "ai" | "heuristic" }) {
  if (mode === "ai") {
    return (
      <Badge variant="brand" className="gap-1">
        <Sparkles className="h-3 w-3" />
        AI-generated
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" className="gap-1">
      <Calculator className="h-3 w-3" />
      Statistical (no API key configured)
    </Badge>
  );
}
