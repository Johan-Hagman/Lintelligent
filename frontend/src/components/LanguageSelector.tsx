import { SelectMenu } from "./ui/SelectMenu";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
] satisfies Array<{ label: string; value: string }>;

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <SelectMenu
      label="Language"
      options={languageOptions}
      value={value}
      placeholder="Select language"
      includePlaceholderOption={false}
      onChange={(next) => onChange(next ?? "javascript")}
    />
  );
}
