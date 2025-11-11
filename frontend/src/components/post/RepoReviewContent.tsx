import RepoPicker from "../RepoPicker";
import ReviewEditor from "./ReviewEditor";

interface RepoReviewContentProps {
  isAuthenticated: boolean;
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onFileSelect: (
    content: string,
    path: string,
    repoInfo?: { owner: string; repo: string; ref: string; filePath: string }
  ) => void;
}

export default function RepoReviewContent({
  isAuthenticated,
  code,
  language,
  onCodeChange,
  onLanguageChange,
  loading,
  onSubmit,
  onFileSelect,
}: RepoReviewContentProps) {
  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Please connect GitHub to review files from repositories.
      </div>
    );
  }

  return (
    <>
      <RepoPicker onFileSelect={onFileSelect} />
      {code && (
        <div style={{ marginTop: "20px" }}>
          <ReviewEditor
            code={code}
            language={language}
            onCodeChange={onCodeChange}
            onLanguageChange={onLanguageChange}
            loading={loading}
            onSubmit={onSubmit}
          />
        </div>
      )}
    </>
  );
}

