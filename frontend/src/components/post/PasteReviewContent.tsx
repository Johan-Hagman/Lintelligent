import ReviewEditor from "./ReviewEditor";

interface PasteReviewContentProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export default function PasteReviewContent({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  loading,
  onSubmit,
}: PasteReviewContentProps) {
  return (
    <ReviewEditor
      code={code}
      language={language}
      onCodeChange={onCodeChange}
      onLanguageChange={onLanguageChange}
      loading={loading}
      onSubmit={onSubmit}
    />
  );
}

