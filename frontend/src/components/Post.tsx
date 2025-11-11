import { useState, useEffect } from "react";
import ErrorAlert from "./ErrorAlert";
import Feedback from "./Feedback";
import Rating from "./Rating";
import PostHeader from "./post/PostHeader";
import ReviewTabs from "./post/ReviewTabs";
import PasteReviewContent from "./post/PasteReviewContent";
import RepoReviewContent from "./post/RepoReviewContent";
import { ReviewFeedback } from "./Post.types";

type ReviewTab = "paste" | "repo";

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

  const handleTabSelect = (tab: ReviewTab) => {
    setActiveTab(tab);
    if (tab === "paste") {
      setRepoInfo(null);
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
      <PostHeader onAuthChange={setIsAuthenticated} />

      <ReviewTabs
        activeTab={activeTab}
        onSelect={handleTabSelect}
        isAuthenticated={isAuthenticated}
      />

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
          <PasteReviewContent
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            loading={loading}
            onSubmit={handleSubmit}
          />
        ) : (
          <RepoReviewContent
            isAuthenticated={isAuthenticated}
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            loading={loading}
            onSubmit={handleSubmit}
            onFileSelect={handleFileSelect}
          />
        )}
      </div>

      <ErrorAlert message={error} />

      {feedback && <Feedback feedback={feedback} />}

      <Rating visible={!!feedback} rated={rated} onRate={handleRating} />
    </div>
  );
}

export default Post;
