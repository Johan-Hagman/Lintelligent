import { useState, useEffect } from "react";

interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

interface AuthStatus {
  authenticated: boolean;
  user?: GitHubUser;
}

interface Props {
  onAuthChange?: (authenticated: boolean) => void;
}

export default function GitHubAuth({ onAuthChange }: Props) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(authStatus.authenticated);
    }
  }, [authStatus.authenticated, onAuthChange]);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setAuthStatus({ authenticated: false });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 text-sm text-text-muted">
        Checking GitHub status…
      </div>
    );
  }

  if (authStatus.authenticated && authStatus.user) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 shadow-sm">
        {authStatus.user.avatar_url && (
          <img
            src={authStatus.user.avatar_url}
            alt={authStatus.user.login}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-text">
          {authStatus.user.login}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-divider bg-surface px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-divider/60 bg-surface-raised/60 px-3 py-2 shadow-sm">
      <a
        href="http://localhost:3001/api/auth/github/login"
        className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Connect GitHub
      </a>
    </div>
  );
}
