import GitHubAuth from "../GitHubAuth";

interface PostHeaderProps {
  onAuthChange: (authenticated: boolean) => void;
}

export default function PostHeader({ onAuthChange }: PostHeaderProps) {
  return (
    <header style={{ marginBottom: "32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "32px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            Lintelligent
          </h1>
          <p style={{ margin: "0", color: "#6b7280", fontSize: "16px" }}>
            AI-powered code review with project context
          </p>
        </div>
        <GitHubAuth onAuthChange={onAuthChange} />
      </div>
    </header>
  );
}

