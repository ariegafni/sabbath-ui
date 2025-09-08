"use client";
import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../service";
import { AuthService, AuthUser } from "../service/auth";
import { UserStatusReason } from "../shared/types/userStatus";

type User = { 
  id: string; 
  name?: string; 
  email?: string;
  is_approved: boolean;
  status_reason?: UserStatusReason;
  status_reason_description?: string;
} | null;

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
  const queryClient = useQueryClient();
  
  const { data: user = null, isLoading: loading, refetch } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        return null;
      }

      try {
        const data = await UserService.getCurrentUser();
        return {
          id: data.id.toString(),
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          is_approved: data.is_approved ?? true, // ברירת מחדל מאומת
          status_reason: data.status_reason,
          status_reason_description: data.status_reason_description,
        };
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Clear tokens if they're invalid
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          AuthService.logout();
        }
        return null;
      }
    },
    staleTime: 15 * 60 * 1000, // User data rarely changes, cache for 15 minutes
    retry: false, // Don't retry auth failures
  });

  const refresh = async () => {
    await refetch();
    // Also invalidate related queries when user refreshes
    queryClient.invalidateQueries({ queryKey: ['host-profile'] });
    queryClient.invalidateQueries({ queryKey: ['unread-count'] });
  };

  return (
    <AuthCtx.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
