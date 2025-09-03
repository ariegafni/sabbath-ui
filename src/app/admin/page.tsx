"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Providers/AuthProvider";
import { AdminService } from "@/service/admin";
import AdminDashboard from "@/features/admin/AdminDashboard";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = useCallback(async () => {
    if (!user) {
      router.replace("/login");
      return;
    }

    try {
      const isAdmin = await AdminService.isCurrentUserAdmin();
      if (!isAdmin) {
        router.replace("/");
        return;
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking admin authorization:', error);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">אימות הרשאות...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">אין הרשאה</h1>
          <p className="text-gray-600">אין לך הרשאה לגשת לאזור זה</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}