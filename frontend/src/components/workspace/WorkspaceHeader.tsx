import GitHubAuth from "../GitHubAuth";

interface WorkspaceHeaderProps {
  onAuthChange: (authenticated: boolean) => void;
}

export default function WorkspaceHeader({
  onAuthChange,
}: WorkspaceHeaderProps) {
  return (
    <header className="mb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Lintelligent
          </h1>
          <p className="mt-2 text-base text-text-subtle">
            AI-powered code review with project context
          </p>
        </div>
        <GitHubAuth onAuthChange={onAuthChange} />
      </div>
    </header>
  );
}
