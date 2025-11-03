interface Props {
  visible: boolean;
  rated: number | null;
  onRate: (rating: number) => void;
}

export default function Rating({ visible, rated, onRate }: Props) {
  if (!visible) return null;
  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      {rated === null ? (
        <div>
          <p style={{ marginBottom: "15px", fontSize: "16px" }}>
            <strong>Was this review helpful?</strong>
          </p>
          <button
            onClick={() => onRate(1)}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            👍 Helpful
          </button>
          <button
            onClick={() => onRate(-1)}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            👎 Not Helpful
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "5px",
          }}
        >
          <strong>✓ Thanks for your feedback!</strong>
          {rated === 1 ? " Glad it was helpful!" : " We'll work on improving!"}
        </div>
      )}
    </div>
  );
}


