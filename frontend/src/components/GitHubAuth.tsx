import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";

export default function GitHubAuth() {
  const { status, loading, logout } = useAuth();

  if (status.authenticated && status.user) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 shadow-sm">
        {status.user.avatar_url && (
          <img
            src={status.user.avatar_url}
            alt={status.user.login}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-text">
          {status.user.login}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          isLoading={loading}
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      as="a"
      href="http://localhost:3001/api/auth/github/login"
      variant="secondary"
      size="sm"
      className="px-4 py-2"
      isLoading={loading}
    >
      {loading ? "Checking GitHub…" : "Connect GitHub"}
    </Button>
  );
}
