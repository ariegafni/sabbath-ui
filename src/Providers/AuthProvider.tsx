"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { UserService } from "../service";

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
      const data = await UserService.getCurrentUser();
      setUser({
        id: data.id.toString(),
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
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
