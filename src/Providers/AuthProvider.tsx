"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { UserService } from "../service";
import { AuthService } from "../service/auth";

type User = { id: string; name?: string; email?: string } | null;

const AuthCtx = createContext<{
  user: User;
  loading: boolean;
  refresh: () => Promise<void>;
}>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        console.log("User not authenticated");
        setUser(null);
        return;
      }

      const data = await UserService.getCurrentUser();
      setUser({
        id: data.id.toString(),
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
      });
      
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      // Clear tokens if they're invalid
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        AuthService.logout();
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  return (
    <AuthCtx.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
