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
      style={{
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        border: "none",
        backgroundColor: disabled ? "#9ca3af" : "#3b82f6",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        boxShadow: disabled ? "none" : "0 2px 4px rgba(59, 130, 246, 0.3)",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }
      }}
    >
      {loading ? "⏳ Reviewing..." : "🔍 Review Code"}
    </button>
  );
}
