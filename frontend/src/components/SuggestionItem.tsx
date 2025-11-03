import { ReviewSuggestion } from "./Post.types";

interface Props {
  suggestion: ReviewSuggestion;
}

export default function SuggestionItem({ suggestion }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        marginBottom: "10px",
        borderRadius: "5px",
        backgroundColor:
          suggestion.severity === "high"
            ? "#fee"
            : suggestion.severity === "medium"
            ? "#ffd"
            : "#efe",
      }}
    >
      <p>
        <strong>Severity:</strong>{" "}
        <span
          style={{
            color:
              suggestion.severity === "high"
                ? "red"
                : suggestion.severity === "medium"
                ? "orange"
                : "green",
          }}
        >
          {suggestion.severity.toUpperCase()}
        </span>
      </p>
      <p>
        <strong>Line:</strong> {suggestion.line}
      </p>
      <p>
        <strong>Message:</strong> {suggestion.message}
      </p>
      <p>
        <strong>Reason:</strong> {suggestion.reason}
      </p>
      {suggestion.fixedCode && (
        <div>
          <strong>Suggested Fix:</strong>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "3px",
              overflow: "auto",
            }}
          >
            {suggestion.fixedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
