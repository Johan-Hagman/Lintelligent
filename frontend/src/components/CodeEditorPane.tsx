import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";

interface Props {
  code: string;
  onChange: (code: string) => void;
  language: string;
}

export default function CodeEditorPane({ code, onChange, language }: Props) {
  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-divider bg-surface-raised">
      <CodeEditor
        value={code}
        onValueChange={(value) => onChange(value)}
        highlight={(value) =>
          highlight(
            value,
            language === "typescript"
              ? languages.typescript
              : languages.javascript,
            language
          )
        }
        padding={15}
        placeholder="Paste your code here..."
        className="h-[500px] max-h-[500px] overflow-auto bg-surface-raised font-mono text-sm text-text focus:outline-none"
        textareaClassName="focus:outline-none caret-primary"
        preClassName="!bg-transparent !text-text !font-mono !text-sm"
      />
    </div>
  );
}
