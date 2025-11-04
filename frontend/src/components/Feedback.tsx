import { ReviewFeedback } from "./Post.types";
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
    <div style={{ marginTop: "32px" }}>
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Review Results
        </h2>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#e5e7eb",
              fontSize: "13px",
              color: "#374151",
            }}
          >
            Model: {feedback.aiModel}
          </span>
          {severityCounts.high && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {severityCounts.high} High
            </span>
          )}
          {severityCounts.medium && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {severityCounts.medium} Medium
            </span>
          )}
          {severityCounts.low && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#d1fae5",
                color: "#065f46",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {severityCounts.low} Low
            </span>
          )}
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#374151",
            }}
          >
            {feedback.summary}
          </p>
        </div>
      </div>

      {feedback.suggestions.length > 0 && (
        <div>
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Suggestions ({feedback.suggestions.length})
          </h3>
          {feedback.suggestions.map((suggestion, index) => (
            <SuggestionItem key={index} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}
