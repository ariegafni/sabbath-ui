"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Button from "@/ui/Button";
import MyHostingRequestsAsHost from "@/features/host/MyHostingRequestsAsHost";

export default function HostingRequestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>חזור</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  בקשות אירוח
                </h1>
                <p className="text-gray-600 text-sm">
                  נהל בקשות אירוח שנשלחו אליך
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <MyHostingRequestsAsHost />
      </div>
    </div>
  );
}
