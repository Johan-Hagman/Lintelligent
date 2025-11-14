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
      <section
        aria-label="GitHub connection required"
        className="rounded-xl border border-divider/70 bg-surface-tinted/60 p-6 text-center text-text-subtle"
      >
        Please connect GitHub to review files from repositories.
      </section>
    );
  }

  return (
    <section aria-label="Review code from repository">
      <RepoPicker onFileSelect={onFileSelect} />
      {code && (
        <section
          aria-label="Selected repository code editor"
          className="mt-6 rounded-xl border border-divider/60 bg-surface-raised/60 p-4"
        >
          <ReviewEditor
            code={code}
            language={language}
            onCodeChange={onCodeChange}
            onLanguageChange={onLanguageChange}
            loading={loading}
            onSubmit={onSubmit}
          />
        </section>
      )}
    </section>
  );
}
