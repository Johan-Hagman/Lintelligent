import { ReviewFeedback } from "./ReviewWorkspace.types";
import SuggestionItem from "./SuggestionItem";

interface Props {
  feedback: ReviewFeedback;
}

export default function Feedback({ feedback }: Props) {
  if (!feedback) return null;

  const severityCounts = feedback.suggestions.reduce((acc, s) => {
    acc[s.severity] = (acc[s.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section aria-label="Review results" className="mt-8 space-y-6">
      <header className="space-y-4 rounded-xl border border-divider bg-surface/80 p-6 shadow-surface backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-text">Review Results</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full bg-surface-raised/70 px-3 py-1 text-xs font-medium text-text-muted">
            Model: {feedback.aiModel}
          </span>
          {severityCounts.high && (
            <span className="inline-flex items-center rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
              {severityCounts.high} High
            </span>
          )}
          {severityCounts.medium && (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning-foreground">
              {severityCounts.medium} Medium
            </span>
          )}
          {severityCounts.low && (
            <span className="inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
              {severityCounts.low} Low
            </span>
          )}
        </div>
        <div className="rounded-lg border border-divider bg-surface p-4">
          <p className="text-sm leading-relaxed text-text">
            {feedback.summary}
          </p>
        </div>
      </header>

      {feedback.suggestions.length > 0 && (
        <section aria-label="Suggested improvements" className="space-y-4">
          <h3 className="text-xl font-semibold text-text">
            Suggestions ({feedback.suggestions.length})
          </h3>
          {feedback.suggestions.map((suggestion, index) => (
            <SuggestionItem key={index} suggestion={suggestion} />
          ))}
        </section>
      )}
    </section>
  );
}
