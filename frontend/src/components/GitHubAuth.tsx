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
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
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
    return <div style={{ padding: "10px" }}>Loading...</div>;
  }

  if (authStatus.authenticated && authStatus.user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px" }}>
        {authStatus.user.avatar_url && (
          <img
            src={authStatus.user.avatar_url}
            alt={authStatus.user.login}
            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
          />
        )}
        <span>{authStatus.user.login}</span>
        <button onClick={handleLogout} style={{ padding: "6px 12px", cursor: "pointer" }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      <a
        href="http://localhost:3001/api/auth/github/login"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#24292e",
          color: "white",
          textDecoration: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Connect GitHub
      </a>
    </div>
  );
}

