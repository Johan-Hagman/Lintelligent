import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: GitHubUser;
}

interface AuthContextValue {
  status: AuthStatus;
  loading: boolean;
  checkAuth: () => Promise<AuthStatus>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setStatus({ authenticated: false });
        return { authenticated: false } as AuthStatus;
      }

      const data = (await response.json()) as AuthStatus;
      setStatus({
        authenticated: Boolean(data.authenticated),
        user: data.user,
      });
      return data;
    } catch (error) {
      console.error("Auth check failed:", error);
      setStatus({ authenticated: false });
      return { authenticated: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setStatus({ authenticated: false });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      loading,
      checkAuth,
      logout,
    }),
    [status, loading, checkAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

