"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, User, Home } from "lucide-react";
import { useRouter } from "next/navigation";

import SettingsSidebar from "@/settings/page";
import { useAuth } from "@/Providers/AuthProvider";

export default function Header() {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // No top publish/manage actions or initials bubble per new spec

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm"
        dir="rtl"
      >
        <nav className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left side - Settings */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="hidden sm:inline">{t("nav.settings")}</span>
            </button>
          </div>

          {/* Center - Logo/Home */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline text-sm font-medium">
                {t("nav.home")}
              </span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("guests.title")}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">{t("auth.login")}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2"></div>
            )}
          </div>
        </nav>
      </header>

      {/* Settings Sidebar */}
      <SettingsSidebar
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Removed host profile modal trigger per new spec */}
    </>
  );
}
