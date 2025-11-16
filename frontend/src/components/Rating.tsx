import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface Props {
  visible: boolean;
  rated: number | null;
  onRate: (rating: number) => void;
}

export default function Rating({ visible, rated, onRate }: Props) {
  if (!visible) return null;

  return (
    <section
      aria-label="Review rating"
      className="mt-8 border-t border-divider pt-6"
    >
      {rated === null ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-text">
            Was this review helpful?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="success" onClick={() => onRate(1)}>
              👍 Helpful
            </Button>
            <Button variant="danger" onClick={() => onRate(-1)}>
              👎 Not Helpful
            </Button>
          </div>
        </div>
      ) : (
        <Card
          tone="subtle"
          padding="sm"
          className="flex flex-wrap items-center gap-2 border-success/40 bg-success/10 text-success"
        >
          <span className="text-lg font-semibold">✓</span>
          <span className="text-sm font-medium text-success">
            Thanks for your feedback!
          </span>
          <span className="text-sm text-success/80">
            {rated === 1
              ? "Glad the review was helpful."
              : "We appreciate the signal and will improve."}
          </span>
        </Card>
      )}
    </section>
  );
}
