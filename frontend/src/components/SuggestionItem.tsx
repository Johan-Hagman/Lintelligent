import { useState, type ComponentProps } from "react";
import { ReviewSuggestion } from "./ReviewWorkspace.types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Props {
  suggestion: ReviewSuggestion;
}

const severityStyles: Record<
  ReviewSuggestion["severity"],
  {
    badgeTone: ComponentProps<typeof Badge>["tone"];
    cardClasses: string;
    headingClass: string;
  }
> = {
  high: {
    badgeTone: "danger",
    cardClasses: "border-danger/60 border-l-4 border-l-danger bg-danger/5",
    headingClass: "text-danger",
  },
  medium: {
    badgeTone: "warning",
    cardClasses: "border-warning/60 border-l-4 border-l-warning bg-warning/5",
    headingClass: "text-warning",
  },
  low: {
    badgeTone: "success",
    cardClasses: "border-success/60 border-l-4 border-l-success bg-success/5",
    headingClass: "text-success",
  },
};

export default function SuggestionItem({ suggestion }: Props) {
  const [copied, setCopied] = useState(false);
  const severity = severityStyles[suggestion.severity] ?? severityStyles.low;

  const handleCopyFix = async () => {
    if (!suggestion.fixedCode) return;
    try {
      await navigator.clipboard.writeText(suggestion.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy fix", error);
    }
  };

  return (
    <article aria-label={`Suggestion at line ${suggestion.line}`}>
      <Card tone="subtle" padding="md" className={severity.cardClasses}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Badge tone={severity.badgeTone} className="uppercase tracking-wide">
            {suggestion.severity}
          </Badge>
          <Badge tone="muted">Line {suggestion.line}</Badge>
        </div>

        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${severity.headingClass}`}>
            {suggestion.message}
          </h3>
          <p className="text-sm leading-relaxed text-text-muted">
            {suggestion.reason}
          </p>
        </div>

        {suggestion.fixedCode && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold text-text">
                Suggested Fix
              </strong>
              <Button
                variant={copied ? "success" : "secondary"}
                size="sm"
                onClick={handleCopyFix}
              >
                {copied ? "✓ Copied!" : "Copy Fix"}
              </Button>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg border border-divider bg-surface-raised px-4 py-3 text-xs leading-6 text-text">
              {suggestion.fixedCode}
            </pre>
          </div>
        )}
      </Card>
    </article>
  );
}
