import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const REFRESH_TOKEN_KEY = 'smartmemo_refresh_token';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
  updateUser: (data: UpdateUserData) => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function extractErrorMessage(body: { error?: unknown }): string {
  const err = body.error;
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return 'Something went wrong';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(
    async (token: string, userId: string): Promise<User | null> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        return res.ok && body.ok ? (body.data as User) : null;
      } catch {
        return null;
      }
    },
    [],
  );

  const setSession = useCallback(
    async (tokens: Tokens) => {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      setAccessToken(tokens.accessToken);
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1])) as {
        sub: string;
      };
      const profile = await fetchUserProfile(tokens.accessToken, payload.sub);
      setUser(profile);
    },
    [fetchUserProfile],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  // Restore session on mount using stored refresh token
  useEffect(() => {
    const restore = async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedRefreshToken}` },
        });
        const body = await res.json();
        if (res.ok && body.ok) {
          await setSession(body.data as Tokens);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, [setSession, clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(extractErrorMessage(body));
      }
      await setSession(body.data as Tokens);
    },
    [setSession],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(extractErrorMessage(body));
      }
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedRefreshToken}` },
        });
      } catch {
        // Ignore network errors; clear session regardless
      }
    }
    clearSession();
  }, [clearSession]);

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${storedRefreshToken}` },
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        await setSession(body.data as Tokens);
        return (body.data as Tokens).accessToken;
      }
      clearSession();
      return null;
    } catch {
      clearSession();
      return null;
    }
  }, [setSession, clearSession]);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response | null> => {
      if (!accessToken) return null;

      const makeRequest = (token: string) =>
        fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });

      let response = await makeRequest(accessToken);

      if (response.status === 401) {
        const newToken = await refreshTokens();
        if (!newToken) return null;
        response = await makeRequest(newToken);
      }

      return response;
    },
    [accessToken, refreshTokens],
  );

  const updateUser = useCallback(
    async (data: UpdateUserData): Promise<void> => {
      if (!user) throw new Error('Not authenticated');
      const res = await authFetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!res) throw new Error('Not authenticated');
      const body = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(extractErrorMessage(body));
      }
      if (body.data) {
        setUser(body.data as User);
      }
    },
    [user, authFetch],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshTokens,
        updateUser,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
