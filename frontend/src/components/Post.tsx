import { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import CodeEditorPane from "./CodeEditorPane";
import ReviewButton from "./ReviewButton";
import ErrorAlert from "./ErrorAlert";
import Feedback from "./Feedback";
import Rating from "./Rating";
import { ReviewFeedback } from "./Post.types";

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

      <LanguageSelector value={language} onChange={setLanguage} />

      <CodeEditorPane code={code} onChange={setCode} language={language} />

      <ReviewButton
        onClick={handleSubmit}
        disabled={loading}
        loading={loading}
      />

      <ErrorAlert message={error} />

      {feedback && <Feedback feedback={feedback} />}

      <Rating visible={!!feedback} rated={rated} onRate={handleRating} />
    </div>
  );
}

export default Post;
