import { ReviewFeedback } from "./Post.types";
import SuggestionItem from "./SuggestionItem";

interface Props {
  feedback: ReviewFeedback;
}

export default function Feedback({ feedback }: Props) {
  if (!feedback) return null;
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Feedback</h2>
      <p>
        <strong>AI Model:</strong> {feedback.aiModel}
      </p>
      <p>
        <strong>Summary:</strong> {feedback.summary}
      </p>

      {feedback.suggestions.length > 0 && (
        <div>
          <h3>Suggestions ({feedback.suggestions.length})</h3>
          {feedback.suggestions.map((suggestion, index) => (
            <SuggestionItem key={index} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}


