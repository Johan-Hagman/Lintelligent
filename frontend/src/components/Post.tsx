import { useState } from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";

interface ReviewSuggestion {
  severity: "low" | "medium" | "high";
  line: number;
  message: string;
  reason: string;
  fixedCode?: string;
}

interface ReviewFeedback {
  suggestions: ReviewSuggestion[];
  summary: string;
  aiModel: string;
}

function Post() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rated, setRated] = useState<number | null>(null);

  const handleRating = async (rating: number) => {
    if (!reviewId) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/review/${reviewId}/rating`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      setRated(rating);
    } catch (err) {
      console.error("Rating error:", err);
      setError("Failed to submit rating");
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback(null);
    setReviewId(null);
    setRated(null);

    try {
      const response = await fetch("http://localhost:3001/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: language,
          reviewType: "best-practices",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to review code");
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setReviewId(data.id); // Save the review ID for rating
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to review code. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Lintelligent</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Language:
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </label>
      </div>

      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <CodeEditor
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(code) =>
            highlight(
              code,
              language === "typescript"
                ? languages.typescript
                : languages.javascript,
              language
            )
          }
          padding={15}
          placeholder="Paste your code here..."
          style={{
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: 14,
            minHeight: "400px",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Reviewing..." : "Review Code"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {feedback && (
        <div style={{ marginTop: "30px" }}>
          <h2>Feedback</h2>
          <p>
            <strong>AI Model:</strong> {feedback.aiModel}
          </p>
          <p>
            <strong>Summary:</strong> {feedback.summary}
          </p>

          {/* Rating buttons */}
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            {rated === null ? (
              <div>
                <p>
                  <strong>Was this review helpful?</strong>
                </p>
                <button
                  onClick={() => handleRating(1)}
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
                  onClick={() => handleRating(-1)}
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
                {rated === 1
                  ? " Glad it was helpful!"
                  : " We'll work on improving!"}
              </div>
            )}
          </div>

          {feedback.suggestions.length > 0 && (
            <div>
              <h3>Suggestions ({feedback.suggestions.length})</h3>
              {feedback.suggestions.map((suggestion, index) => (
                <div
                  key={index}
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Post;
