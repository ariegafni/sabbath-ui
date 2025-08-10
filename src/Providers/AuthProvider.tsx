"use client";
import { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; name?: string; email?: string } | null;

const AuthCtx = createContext<{ user: User; loading: boolean; refresh: () => Promise<void> }>({
  user: null, loading: true, refresh: async () => {}
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  return <AuthCtx.Provider value={{ user, loading, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
