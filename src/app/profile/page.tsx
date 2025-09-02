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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = JSON.parse(localStorage.getItem("user") || "{}");
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
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    ["access_token", "refresh_token", "user"].forEach((k) =>
      localStorage.removeItem(k)
    );
    document.cookie = "auth=; Max-Age=0; path=/";
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t("profile.confirmDelete"))) return;
    try {
      setIsSubmitting(true);
      await UserService.deleteAccount();
      alert(t("profile.deleteSuccess"));
      handleLogout();
    } catch {
      alert(t("profile.deleteError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportProblem = async () => {
    const description = prompt(t("profile.reportPrompt"));
    if (!description?.trim()) return;
    try {
      setIsSubmitting(true);
      await GeneralService.reportProblem({ description: description.trim() });
      alert(t("profile.reportSuccess"));
    } catch {
      alert(t("profile.reportError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleConfirmUpload = async () => {
    if (!preview) return;
    try {
      setIsUploading(true);
      const blob = await (await fetch(preview)).blob();
      const file = new File([blob], "profile.jpg", { type: blob.type });
      const res = await UserService.uploadProfileImage(file);
      setProfile((p) => (p ? { ...p, photo_url: res.profile_image } : p));
      const data = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data, profile_image: res.profile_image })
      );
      setPreview(null);
    } catch {
      alert(t("profile.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("profile.errorLoading")}</p>
        <Button onClick={() => location.reload()}>{t("common.retry")}</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            <Edit3 className="h-4 w-4" /> {t("common.edit")}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <label htmlFor="profileImageInput" className="cursor-pointer w-full h-full flex items-center justify-center">
              {(preview || profile.photo_url) ? (
                <img
                  src={preview || profile.photo_url}
                  alt={profile.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </label>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
            {preview && (
              <Button
                onClick={handleConfirmUpload}
                className="mt-2"
                disabled={isUploading}
              >
                {t("profile.uploadConfirm")}
              </Button>
            )}

            {profile.settings && (
              <div className="mt-4 pt-4 border-t text-sm text-gray-600 space-y-1">
                <div>
                  {t("common.language")}:{" "}
                  {profile.settings.language === "he"
                    ? t("common.hebrew")
                    : t("common.english")}
                </div>
                <div>
                  {t("common.timezone")}: {profile.settings.timezone}
                </div>
                <div>
                  {t("common.emailNotifications")}:{" "}
                  {profile.settings.email_notifications
                    ? t("common.on")
                    : t("common.off")}
                </div>
                <div>
                  {t("common.pushNotifications")}:{" "}
                  {profile.settings.push_notifications
                    ? t("common.on")
                    : t("common.off")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-medium mb-4">{t("settings.title")}</h3>
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-gray-500" />
              <span>{t("settings.language")}</span>
            </div>
            <span className={`text-gray-400 ${languageOpen ? "rotate-90" : ""}`}>
              →
            </span>
          </button>
          {languageOpen && (
            <div className="pl-10">
              <LanguageSwitcher />
            </div>
          )}
          <div className="flex items-center gap-3 p-3 text-gray-700">
            <Settings className="h-5 w-5 text-gray-500" />
            <span>{t("settings.account")}</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-gray-700">
            <Bell className="h-5 w-5 text-gray-500" />
            <span>{t("settings.notifications")}</span>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <button
            onClick={handleReportProblem}
            disabled={isSubmitting}
            className="w-full flex justify-between p-3 rounded-lg hover:bg-gray-50 text-red-600"
          >
            {t("common.reportProblem")} →
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isSubmitting}
            className="w-full flex justify-between p-3 rounded-lg hover:bg-gray-50 text-red-600"
          >
            {t("settings.deleteAccount")} →
          </button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex justify-center gap-2 text-red-600"
          >
            <LogOut className="h-4 w-4" /> {t("auth.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
