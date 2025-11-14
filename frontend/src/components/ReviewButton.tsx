interface Props {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function ReviewButton({ onClick, disabled, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        disabled
          ? "cursor-not-allowed bg-text-muted/40 text-text-muted opacity-60"
          : "bg-primary text-primary-foreground shadow-glow hover:bg-primary-emphasis"
      }`}
    >
      {loading ? "⏳ Reviewing..." : "🔍 Review Code"}
    </button>
  );
}
