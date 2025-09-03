"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import Button from "@/ui/Button";
import { AdminService } from "@/service/admin";
import { useAuth } from "@/Providers/AuthProvider";

export default function AdminButton() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const adminStatus = await AdminService.isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  const handleAdminClick = () => {
    router.push('/admin');
  };

  // Don't render anything if loading or not admin
  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button
      onClick={handleAdminClick}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
      title="אזור ניהול"
    >
      <Shield className="h-4 w-4" />
      <span className="hidden sm:inline">אדמין</span>
    </Button>
  );
}