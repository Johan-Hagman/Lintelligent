import { useState, useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import CodeEditorPane from "./CodeEditorPane";
import ReviewButton from "./ReviewButton";
import ErrorAlert from "./ErrorAlert";
import Feedback from "./Feedback";
import Rating from "./Rating";
import GitHubAuth from "./GitHubAuth";
import RepoPicker from "./RepoPicker";
import { ReviewFeedback } from "./Post.types";

function Post() {
  const [activeTab, setActiveTab] = useState<"paste" | "repo">("paste");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rated, setRated] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
    ref: string;
    filePath: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleFileSelect = (
    content: string,
    path: string,
    repoInfo?: { owner: string; repo: string; ref: string; filePath: string }
  ) => {
    setCode(content);
    setFeedback(null);
    setReviewId(null);
    setRated(null);
    setError("");
    setRepoInfo(repoInfo || null);
    // Auto-detect language from file extension
    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      setLanguage("typescript");
    } else {
      setLanguage("javascript");
    }
  };

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
        credentials: "include",
        body: JSON.stringify({
          code: code,
          language: language,
          reviewType: "best-practices",
          ...(repoInfo && {
            repoInfo: {
              owner: repoInfo.owner,
              repo: repoInfo.repo,
              ref: repoInfo.ref,
              filePath: repoInfo.filePath,
            },
          }),
        }),
      });

      // Debug: log what we're sending
      console.log("Sending review request with repoInfo:", repoInfo);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setReviewId(data.id); // Save the review ID for rating
    } catch (err) {
      console.error("Review error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to review code";
      setError(
        errorMessage ||
          "Failed to review code. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
                letterSpacing: "-0.5px",
              }}
            >
              Lintelligent
            </h1>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "16px" }}>
              AI-powered code review with project context
            </p>
          </div>
          <GitHubAuth onAuthChange={setIsAuthenticated} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => {
            setActiveTab("paste");
            setRepoInfo(null); // Clear repo info when switching to paste tab
          }}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor: "transparent",
            borderBottom:
              activeTab === "paste"
                ? "2px solid #3b82f6"
                : "2px solid transparent",
            color: activeTab === "paste" ? "#3b82f6" : "#6b7280",
            cursor: "pointer",
            fontWeight: activeTab === "paste" ? "600" : "400",
          }}
        >
          Paste Code
        </button>
        <button
          onClick={() => setActiveTab("repo")}
          disabled={!isAuthenticated}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor: "transparent",
            borderBottom:
              activeTab === "repo"
                ? "2px solid #3b82f6"
                : "2px solid transparent",
            color:
              activeTab === "repo"
                ? "#3b82f6"
                : isAuthenticated
                ? "#6b7280"
                : "#d1d5db",
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            fontWeight: activeTab === "repo" ? "600" : "400",
            opacity: isAuthenticated ? 1 : 0.5,
          }}
        >
          Review from Repo
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {activeTab === "paste" ? (
          <>
            <LanguageSelector value={language} onChange={setLanguage} />
            <CodeEditorPane
              code={code}
              onChange={setCode}
              language={language}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <ReviewButton
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
              />
            </div>
          </>
        ) : (
          <>
            {!isAuthenticated ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Please connect GitHub to review files from repositories.
              </div>
            ) : (
              <>
                <RepoPicker onFileSelect={handleFileSelect} />
                {code && (
                  <>
                    <div style={{ marginTop: "20px" }}>
                      <LanguageSelector
                        value={language}
                        onChange={setLanguage}
                      />
                    </div>
                    <CodeEditorPane
                      code={code}
                      onChange={setCode}
                      language={language}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "16px",
                      }}
                    >
                      <ReviewButton
                        onClick={handleSubmit}
                        disabled={loading}
                        loading={loading}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <ErrorAlert message={error} />

      {feedback && <Feedback feedback={feedback} />}

      <Rating visible={!!feedback} rated={rated} onRate={handleRating} />
    </div>
  );
}

export default Post;
