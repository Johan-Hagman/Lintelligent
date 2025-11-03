interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        Language:
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
        </select>
      </label>
    </div>
  );
}
