import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";

type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Au démarrage, on regarde si un token existe déjà dans localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    fetchCurrentUser(storedToken);
  }, []);

  const fetchCurrentUser = async (jwtToken: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer le profil.");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(jwtToken);
      localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
    } catch (err) {
      console.error("Erreur lors de la récupération du profil :", err);
      setUser(null);
      setToken(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error || "Erreur lors de la connexion.";
      throw new Error(message);
    }

    const jwtToken: string = data.token;
    const userData: AuthUser = data.user;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error || "Erreur lors de l'inscription.";
      throw new Error(message);
    }

    const jwtToken: string = data.token;
    const userData: AuthUser = data.user;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
