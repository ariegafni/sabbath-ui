"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import MultiStepRegistration from "@/features/auth/MultiStepRegistration";

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const { t } = useTranslation();
  const [showMultiStepRegistration, setShowMultiStepRegistration] = useState(false);


  // Show the multi-step registration modal
  if (showMultiStepRegistration) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-50">
          <MultiStepRegistration
            isOpen={showMultiStepRegistration}
            onClose={() => setShowMultiStepRegistration(false)}
            onComplete={() => {
              setShowMultiStepRegistration(false);
              onSwitchToLogin();
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t("auth.register")}
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          {t("auth.registerSubtitle")}
        </p>
      </div>
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-6">
            תהליך רישום חדש ומשופר עם כמה שלבים קצרים
          </p>
          <button
            onClick={() => setShowMultiStepRegistration(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            התחל רישום
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {t("auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
            >
              {t("auth.loginToAccount")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
