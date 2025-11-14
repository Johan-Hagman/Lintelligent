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
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text">
            Was this review helpful?
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onRate(1)}
              className="inline-flex items-center rounded-lg bg-success px-5 py-2 text-base font-semibold text-success-foreground transition hover:bg-success/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              👍 Helpful
            </button>
            <button
              onClick={() => onRate(-1)}
              className="inline-flex items-center rounded-lg bg-danger px-5 py-2 text-base font-semibold text-danger-foreground transition hover:bg-danger/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              👎 Not Helpful
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-success/40 bg-success/10 px-5 py-4 text-success">
          <h2 className="mb-1 text-lg font-semibold">
            Thanks for your feedback!
          </h2>
          <p className="text-sm text-success/80">
            {rated === 1 ? "Glad it was helpful!" : "We'll work on improving!"}
          </p>
        </div>
      )}
    </section>
  );
}
