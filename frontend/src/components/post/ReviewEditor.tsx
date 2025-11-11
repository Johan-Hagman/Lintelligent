import LanguageSelector from "../LanguageSelector";
import CodeEditorPane from "../CodeEditorPane";
import ReviewButton from "../ReviewButton";

interface ReviewEditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  loading: boolean;
  onSubmit: () => void;
  showLanguageSelector?: boolean;
}

export default function ReviewEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  loading,
  onSubmit,
  showLanguageSelector = true,
}: ReviewEditorProps) {
  return (
    <>
      {showLanguageSelector && (
        <LanguageSelector value={language} onChange={onLanguageChange} />
      )}
      <CodeEditorPane code={code} onChange={onCodeChange} language={language} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        <ReviewButton onClick={onSubmit} disabled={loading} loading={loading} />
      </div>
    </>
  );
}

