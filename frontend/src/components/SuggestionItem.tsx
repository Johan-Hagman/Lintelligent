import { useState } from "react";
import { ReviewSuggestion } from "./Post.types";

interface Props {
  suggestion: ReviewSuggestion;
}

export default function SuggestionItem({ suggestion }: Props) {
  const [copied, setCopied] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          bg: "#fee2e2",
          border: "#ef4444",
          text: "#991b1b",
          chip: "#dc2626",
        };
      case "medium":
        return {
          bg: "#fef3c7",
          border: "#f59e0b",
          text: "#92400e",
          chip: "#d97706",
        };
      default:
        return {
          bg: "#d1fae5",
          border: "#10b981",
          text: "#065f46",
          chip: "#059669",
        };
    }
  };

  const handleCopyFix = async () => {
    if (suggestion.fixedCode) {
      await navigator.clipboard.writeText(suggestion.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const colors = getSeverityColor(suggestion.severity);

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.chip}`,
        padding: "16px",
        marginBottom: "12px",
        borderRadius: "8px",
        backgroundColor: colors.bg,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            backgroundColor: colors.chip,
            color: "white",
            letterSpacing: "0.5px",
          }}
        >
          {suggestion.severity}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "500",
            backgroundColor: "rgba(0,0,0,0.05)",
            color: "#374151",
          }}
        >
          Line {suggestion.line}
        </span>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {suggestion.message}
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: "1.5",
          }}
        >
          {suggestion.reason}
        </p>
      </div>

      {suggestion.fixedCode && (
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <strong style={{ fontSize: "14px", color: "#374151" }}>
              Suggested Fix:
            </strong>
            <button
              onClick={handleCopyFix}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: copied ? "#10b981" : "white",
                color: copied ? "white" : "#374151",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Copied!" : "Copy Fix"}
            </button>
          </div>
          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              padding: "12px",
              borderRadius: "6px",
              overflow: "auto",
              fontSize: "13px",
              lineHeight: "1.5",
              margin: "0",
              border: "1px solid #374151",
            }}
          >
            {suggestion.fixedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
