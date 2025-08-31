"use client";

import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MyHostingRequests from "@/features/host/MyHostingRequests";

export default function PersonalAreaPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t("common.back")}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("personalArea.myRequestsTitle")}
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <MyHostingRequests />
      </div>
    </div>
  );
}
