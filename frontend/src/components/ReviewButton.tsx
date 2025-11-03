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
        padding: "10px 20px",
        fontSize: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Reviewing..." : "Review Code"}
    </button>
  );
}


