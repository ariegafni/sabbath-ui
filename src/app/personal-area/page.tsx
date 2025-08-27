"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MyHostingRequests from "@/features/host/MyHostingRequests";

export default function PersonalAreaPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showRequests, setShowRequests] = useState(false);

  if (showRequests) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowRequests(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("personalArea.backToPersonalArea")}
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
              {t("personalArea.title")}
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Messages Card */}
          <Link
            href="/messages"
            className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-all duration-200 hover:border-blue-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("messages.title")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("personalArea.messages.description")}
              </p>
              <div className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                <span>{t("personalArea.messages.open")}</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </Link>

          {/* My Requests Card */}
          <button
            onClick={() => setShowRequests(true)}
            className="group block bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-all duration-200 hover:border-green-300 text-left"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("personalArea.myRequestsTitle")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("personalArea.requests.description")}
              </p>
              <div className="inline-flex items-center gap-2 text-green-600 font-medium group-hover:text-green-700 transition-colors">
                <span>{t("personalArea.requests.open")}</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {t("personalArea.footerNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
