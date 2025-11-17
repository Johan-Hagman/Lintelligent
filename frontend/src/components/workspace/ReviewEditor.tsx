import LanguageSelector from "../LanguageSelector";
import CodeEditorPane from "../CodeEditorPane";
import { Button } from "../ui/Button";

interface ReviewEditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  loading: boolean;
  onSubmit: () => void;
  showLanguageSelector?: boolean;
  onReset?: () => void;
}

export default function ReviewEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  loading,
  onSubmit,
  showLanguageSelector = true,
  onReset,
}: ReviewEditorProps) {
  const hasCode = code.trim().length > 0;

  return (
    <section aria-label="Code editor" className="space-y-5">
      {showLanguageSelector && (
        <LanguageSelector value={language} onChange={onLanguageChange} />
      )}
      <CodeEditorPane code={code} onChange={onCodeChange} language={language} />
      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onReset && (
          <Button
            variant="ghost"
            size="md"
            onClick={onReset}
            disabled={!hasCode || loading}
          >
            Clear Code
          </Button>
        )}
        <Button
          onClick={onSubmit}
          disabled={loading}
          isLoading={loading}
          size="lg"
        >
          {loading ? "Reviewing..." : "Review Code"}
        </Button>
      </div>
    </section>
  );
}
