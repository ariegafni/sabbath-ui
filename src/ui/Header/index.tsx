"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, User, Home, X, Calendar, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import SettingsSidebar from "@/settings/page";
import HostProfileForm from "../host-profile/page";
import { useAuth } from "@/Providers/AuthProvider";
import { HostService } from "@/shared/service";

export default function Header() {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHostProfileOpen, setIsHostProfileOpen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : null;

  useEffect(() => {
    if (user) {
      checkIfUserIsHost();
    }
  }, [user]);

  const checkIfUserIsHost = async () => {
    try {
      const hostProfile = await HostService.getCurrentUserHostProfile();
      setIsHost(!!hostProfile);
    } catch (error) {
      console.error("Failed to check if user is host:", error);
      setIsHost(false);
    }
  };

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
            {isHost ? (
              <button
                onClick={() => router.push("/manage-hosting")}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 hover:from-green-700 hover:to-emerald-700 whitespace-nowrap min-h-[40px] flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                נהל אירוח
              </button>
            ) : (
              <button
                onClick={() => setIsHostProfileOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-700 hover:to-purple-700 whitespace-nowrap min-h-[40px] flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("nav.publish")}
              </button>
            )}
            {!user ? (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">{t("auth.login")}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Settings Sidebar */}
      <SettingsSidebar
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Host Profile Modal with proper scrolling */}
      {isHostProfileOpen && (
        <div
          className="modal-overlay flex justify-center items-center p-4"
          dir="rtl"
        >
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t("hostProfile.title")}
              </h2>
              <button
                onClick={() => setIsHostProfileOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="modal-scrollable">
              <HostProfileForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
