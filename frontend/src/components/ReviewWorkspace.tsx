import { useState } from "react";
import ErrorAlert from "./ErrorAlert";
import Feedback from "./Feedback";
import Rating from "./Rating";
import WorkspaceHeader from "./workspace/WorkspaceHeader";
import WorkspaceTabs from "./workspace/WorkspaceTabs";
import PasteReviewContent from "./workspace/PasteReviewContent";
import RepoReviewContent from "./workspace/RepoReviewContent";
import { ReviewFeedback } from "./ReviewWorkspace.types";
import { useAuth } from "../helper/AuthContext";

type ReviewTab = "paste" | "repo";

function ReviewWorkspace() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("paste");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rated, setRated] = useState<number | null>(null);
  const [repoInfo, setRepoInfo] = useState<{
    owner: string;
    repo: string;
    ref: string;
    filePath: string;
  } | null>(null);
  const { status: authStatus } = useAuth();

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
          code,
          language,
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
    <article
      aria-label="Code review session"
      className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-10 text-text sm:px-6 lg:px-8"
    >
      <WorkspaceHeader />

      <WorkspaceTabs
        activeTab={activeTab}
        onSelect={handleTabSelect}
        isAuthenticated={authStatus.authenticated}
      />

      <section
        aria-label="Review input panel"
        className="rounded-xl border border-divider bg-surface shadow-surface p-6 sm:p-8"
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
            isAuthenticated={authStatus.authenticated}
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            loading={loading}
            onSubmit={handleSubmit}
            onFileSelect={handleFileSelect}
          />
        )}
      </section>

      <ErrorAlert message={error} />

      {feedback && <Feedback feedback={feedback} />}

      <Rating visible={!!feedback} rated={rated} onRate={handleRating} />
    </article>
  );
}

export default ReviewWorkspace;
