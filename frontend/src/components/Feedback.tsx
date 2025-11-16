import { ReviewFeedback } from "./ReviewWorkspace.types";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
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
      <Card tone="muted" padding="lg" className="space-y-4 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-text">Review Results</h2>
        <div className="flex flex-wrap gap-3">
          <Badge tone="muted">Model: {feedback.aiModel}</Badge>
          {severityCounts.high && (
            <Badge tone="danger">{severityCounts.high} High</Badge>
          )}
          {severityCounts.medium && (
            <Badge tone="warning">{severityCounts.medium} Medium</Badge>
          )}
          {severityCounts.low && (
            <Badge tone="success">{severityCounts.low} Low</Badge>
          )}
        </div>
        <Card tone="subtle" padding="sm" className="border-divider/60">
          <p className="text-sm leading-relaxed text-text">
            {feedback.summary}
          </p>
        </Card>
      </Card>

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
