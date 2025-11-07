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
    <div
      style={{
        marginBottom: "20px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
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
        style={{
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          fontSize: 14,
          height: "500px",
          maxHeight: "500px",
          overflow: "auto",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
        }}
      />
    </div>
  );
}
