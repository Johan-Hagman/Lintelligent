import { useState } from "react";
import { ReviewSuggestion } from "./Post.types";

interface Props {
  suggestion: ReviewSuggestion;
}

export default function SuggestionItem({ suggestion }: Props) {
  const [copied, setCopied] = useState(false);

  const severityClasses: Record<
    ReviewSuggestion["severity"],
    {
      container: string;
      chip: string;
      heading: string;
    }
  > = {
    high: {
      container: "border-danger/50 border-l-danger bg-danger/10 text-danger",
      chip: "bg-danger text-danger-foreground",
      heading: "text-danger",
    },
    medium: {
      container:
        "border-warning/50 border-l-warning bg-warning/10 text-warning-foreground",
      chip: "bg-warning text-warning-foreground",
      heading: "text-warning-foreground",
    },
    low: {
      container:
        "border-success/50 border-l-success bg-success/10 text-success",
      chip: "bg-success text-success-foreground",
      heading: "text-success",
    },
  };

  const handleCopyFix = async () => {
    if (suggestion.fixedCode) {
      await navigator.clipboard.writeText(suggestion.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const severity = severityClasses[suggestion.severity] || severityClasses.low;

  return (
    <article
      aria-label={`Suggestion at line ${suggestion.line}`}
      className={`mb-3 rounded-xl border border-l-4 p-4 shadow-sm backdrop-blur-sm ${severity.container}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${severity.chip}`}
        >
          {suggestion.severity}
        </span>
        <span className="inline-flex items-center rounded-lg bg-surface/60 px-3 py-1 text-xs font-medium text-text">
          Line {suggestion.line}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className={`text-lg font-semibold text-text ${severity.heading}`}>
          {suggestion.message}
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          {suggestion.reason}
        </p>
      </div>

      {suggestion.fixedCode && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <strong className="text-sm font-semibold text-text">
              Suggested Fix
            </strong>
            <button
              onClick={handleCopyFix}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                copied
                  ? "border-success bg-success text-success-foreground"
                  : "border-divider bg-surface text-text hover:border-primary hover:text-primary"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy Fix"}
            </button>
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg border border-divider bg-surface-raised px-4 py-3 text-xs leading-6 text-text">
            {suggestion.fixedCode}
          </pre>
        </div>
      )}
    </article>
  );
}
