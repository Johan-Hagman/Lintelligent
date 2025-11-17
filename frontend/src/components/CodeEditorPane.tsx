import { useCallback } from "react";
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
  const moveFocus = useCallback((current: HTMLElement, direction: 1 | -1) => {
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(
      (el) =>
        el.offsetParent !== null &&
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-hidden") !== "true"
    );

    if (elements.length === 0) return;

    const currentIndex = elements.indexOf(current);
    const targetIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : elements.length - 1
        : Math.min(Math.max(currentIndex + direction, 0), elements.length - 1);

    if (currentIndex === targetIndex && elements.length > 1) {
      const fallbackIndex = direction === 1 ? elements.length - 1 : 0;
      elements[fallbackIndex]?.focus();
      return;
    }

    elements[targetIndex]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Tab" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        moveFocus(event.currentTarget as HTMLElement, event.shiftKey ? -1 : 1);
      }
    },
    [moveFocus]
  );

  return (
    <div className="group mb-5 rounded-xl border border-divider bg-surface-raised overflow-hidden">
      <div className="h-[500px] max-h-[500px] overflow-auto">
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
          className="min-h-[500px] bg-surface-raised font-mono text-sm text-text focus:outline-none"
          textareaClassName="focus:outline-none caret-primary"
          preClassName="!bg-transparent !text-text !font-mono !text-sm"
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
