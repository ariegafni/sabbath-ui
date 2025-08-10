"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import SettingsSidebar from "@/settings/page";
import HostProfileForm from "../host-profile/page";

export default function Header() {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHostProfileOpen, setIsHostProfileOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header className="border-b bg-background" dir="rtl">
        <nav className="mx-auto max-w-6xl h-16 px-4 flex items-center justify-between">
          {/* כפתור הגדרות */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>{t("nav.settings")}</span>
          </button>

          {/* כותרת מרכזית */}
          <h1 className="text-lg font-bold">{t("guests.title")}</h1>

          {/* כפתורים בצד ימין */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHostProfileOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              {t("nav.publish")}
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span>{t("auth.login")}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Sidebar הגדרות */}
      <SettingsSidebar
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Host Profile Modal */}
      {isHostProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <HostProfileForm />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsHostProfileOpen(false)}
                className="px-4 py-2 border rounded-md"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
