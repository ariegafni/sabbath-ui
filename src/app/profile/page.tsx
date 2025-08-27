"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Providers/AuthProvider";
import { User, Settings, LogOut, Bell, Edit3 } from "lucide-react";
import Button from "@/ui/Button";
import { HostService, UserService, GeneralService } from "@/service";
import LanguageSwitcher from "@/ui/LanguageSwitcher";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  phone?: string;
  is_host: boolean;
  total_hostings?: number;
  rating?: number;
  settings?: {
    email_notifications: boolean;
    push_notifications: boolean;
    language: string;
    timezone: string;
    privacy_level: string;
  };
  stats?: {
    total_hostings: number;
    total_guests: number;
    average_rating: number;
    response_rate: number;
    response_time_hours: number;
  };
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState(
    typeof window !== "undefined" &&
      (i18n.language || localStorage.getItem("i18nextLng") || "he")
        .toString()
        .startsWith("he")
      ? "he"
      : "en"
  );

  // Sync language from localStorage on mount and whenever i18n changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("i18nextLng") || i18n.language || "he";
    const normalized = stored.toString().startsWith("he") ? "he" : "en";
    if (normalized !== language) {
      setLanguage(normalized);
    }
    if (i18n.language !== normalized) {
      i18n.changeLanguage(normalized).catch(() => {});
    }
  }, [i18n.language]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Get user data from localStorage or use the user from auth context
      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("No user data found");
      }

      const data = JSON.parse(userData);

      // Check if user has a host profile
      const hostProfile = await HostService.getCurrentUserHostProfile();

      setProfile({
        id: data._id || data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        photo_url: data.profile_image,
        bio: data.bio,
        phone: data.phone,
        is_host: !!hostProfile,
        total_hostings: hostProfile?.total_hostings || 0,
        rating: hostProfile?.rating || 0,
        settings: data.settings,
        stats: data.stats,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    document.cookie = "auth=; Max-Age=0; path=/";
    window.location.href = "/";
  };

  const handleChangeLanguage = async (lang: "he" | "en") => {
    try {
      setLanguage(lang);
      await i18n.changeLanguage(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", lang);
      }
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t("profile.confirmDelete"))) {
      return;
    }
    try {
      setIsSubmitting(true);
      await UserService.deleteAccount();
      alert(t("profile.deleteSuccess"));
      handleLogout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(t("profile.deleteError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportProblem = async () => {
    const description = prompt(t("profile.reportPrompt"));
    if (!description || !description.trim()) {
      return;
    }
    try {
      setIsSubmitting(true);
      await GeneralService.reportProblem({ description: description.trim() });
      alert(t("profile.reportSuccess"));
    } catch (error) {
      console.error("Failed to report problem:", error);
      alert(t("profile.reportError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-gray-600">{t("profile.errorLoading")}</p>
          <Button onClick={fetchProfile} className="mt-4">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("profile.title")}
            </h1>
            <Button
              onClick={() => setShowEditForm(!showEditForm)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-600" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.name}
              </h2>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <span>{profile.email}</span>
                </div>
              </div>

              {/* Settings Display */}
              {profile.settings && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t("settings.title")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">
                        {t("common.language")}:
                      </span>{" "}
                      {profile.settings.language === "he"
                        ? t("common.hebrew")
                        : t("common.english")}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("common.timezone")}:
                      </span>{" "}
                      {profile.settings.timezone}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("common.emailNotifications")}:
                      </span>{" "}
                      {profile.settings.email_notifications
                        ? t("common.on")
                        : t("common.off")}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("common.pushNotifications")}:
                      </span>{" "}
                      {profile.settings.push_notifications
                        ? t("common.on")
                        : t("common.off")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("settings.title")}
          </h3>

          <div className="space-y-3">
            {/* Language Selector (collapsible with shared component) */}
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{t("settings.language")}</span>
              </div>
              <span
                className={`text-gray-400 transition-transform ${
                  languageOpen ? "rotate-90" : ""
                }`}
              >
                →
              </span>
            </button>
            {languageOpen && (
              <div className="pl-10">
                <LanguageSwitcher />
              </div>
            )}

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{t("settings.account")}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">
                  {t("settings.notifications")}
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("profile.accountActions")}
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleReportProblem}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-red-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span>{t("common.reportProblem")}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-red-600 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span>{t("settings.deleteAccount")}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
