"use client";

import { useAuth } from '@/Providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MyReports } from '@/features/support/MyReports';
import { AuthService } from '@/service/auth';

export default function MyReportsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check if token exists
    const token = AuthService.getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            נדרשת התחברות
          </h2>
          <p className="text-gray-600 mb-6">
            עליך להתחבר כדי לצפות בדיווחים
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return <MyReports />;
}