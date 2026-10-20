import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";
import socket from "../lib/socket";
import type { User, UserRole } from "../types";

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    city?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchCurrentUser();
  }, []);

useEffect(() => {
  if (loading || !user) {
    socket.disconnect();
    return;
  }

  const handleConnect = () => {
    console.log("Socket connected:", socket.id);
  };

  const handleConnectError = (error: Error) => {
    console.error("Socket connection failed:", error.message);
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);

  socket.connect();

  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
    socket.disconnect();
  };
}, [user, loading]);

  const register = async (data: {
  name: string;
  email: string;
  password: string;
  city?: string;
  phone?: string;
}): Promise<User> => {
  const response = await api.post("/auth/register", data);
  const registeredUser = response.data.data.user as User;

  setUser(registeredUser);
  return registeredUser;
};

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const loggedInUser = response.data.data.user as User;
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}