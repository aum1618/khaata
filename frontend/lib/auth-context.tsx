"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { User } from "./types";
import { apiGet, apiPost } from "./api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiGet("/auth/profile");
        setUser(profile);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const data = await apiPost("/auth/login", { email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
        });
        return true;
      }
      return false;
    },
    [],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      const data = await apiPost("/auth/signup", { name, email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
        });
        return true;
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    apiPost("/auth/logout", {}).catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await apiGet("/auth/profile");
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
