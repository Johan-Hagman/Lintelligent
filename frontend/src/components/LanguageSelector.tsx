interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  const selectId = "language-selector";
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="text-sm font-medium text-text" htmlFor={selectId}>
        Language
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-[220px] rounded-lg border border-divider bg-surface px-3 py-2 text-sm text-text shadow-sm transition focus:border-primary focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
      </select>
    </div>
  );
}
