"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Providers/AuthProvider";
import { User as UserIcon, Settings, LogOut, Bell, Edit3, MessageSquare } from "lucide-react";
import Button from "@/ui/Button";
import { GeneralService, UserService } from "@/service";
import LanguageSwitcher from "@/ui/LanguageSwitcher";
import UserReportsModal from "@/features/support/LazyUserReportsModal";
import { useUserProfile, useHostProfile } from "@/shared/lib/hooks";
import { queryClient } from "@/shared/lib/queryClient";

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

  // Use React Query hooks for data fetching
  const { data: userProfileData, isLoading: userProfileLoading } = useUserProfile();
  const { data: hostProfileData, isLoading: hostProfileLoading } = useHostProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    phone: "",
    email: ""
  });

  // Combine data from localStorage and API calls
  const profile = useMemo(() => {
    if (!user || !userProfileData) return null;

    const localData = JSON.parse(localStorage.getItem("user") || "{}");
    
    return {
      id: userProfileData.id?.toString() || localData._id || localData.id,
      name: `${userProfileData.first_name} ${userProfileData.last_name}`,
      email: userProfileData.email,
      photo_url: userProfileData.profile_image || localData.profile_image,
      bio: userProfileData.bio || localData.bio,
      phone: userProfileData.phone || localData.phone,
      is_host: !!hostProfileData,
      total_hostings: hostProfileData?.total_hostings || 0,
      rating: hostProfileData?.rating || 0,
      settings: localData.settings,
      stats: localData.stats,
    };
  }, [user, userProfileData, hostProfileData]);

  const loading = userProfileLoading || hostProfileLoading;

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
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      const data = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...data, profile_image: res.profile_image })
      );
      setPreview(null);
      alert("תמונת הפרופיל עודכנה בהצלחה!");
    } catch {
      alert(t("profile.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize edit form with current data
  const initializeEditForm = (field: string) => {
    setEditingField(field);
    if (field === "phone") {
      setEditFormData(prev => ({ ...prev, phone: user?.phone || "" }));
    } else if (field === "email") {
      setEditFormData(prev => ({ ...prev, email: user?.email || "" }));
    }
  };

  // Handle profile updates
  const handleUpdateProfile = async (field: string) => {
    if (!editFormData[field as keyof typeof editFormData].trim()) {
      alert(`אנא הכנס ${field === "phone" ? "מספר טלפון" : "כתובת אימייל"} תקין`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updateData: any = {};
      if (field === "phone") {
        updateData.phone = editFormData.phone.trim();
      } else if (field === "email") {
        updateData.email = editFormData.email.trim();
      }

      await UserService.updateProfile(updateData);
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userData, ...updateData }));
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      setEditingField(null);
      alert(`${field === "phone" ? "מספר הטלפון" : "כתובת האימייל"} עודכן בהצלחה!`);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(`שגיאה בעדכון ${field === "phone" ? "מספר הטלפון" : "כתובת האימייל"}`);
    } finally {
      setIsSubmitting(false);
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
                <UserIcon className="h-12 w-12 text-gray-400" />
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

        {/* Profile Edit Form */}
        {showEditForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-6 text-gray-900">השלמת פרטי פרופיל</h3>
            
            <div className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    {(preview || user?.profile_image) ? (
                      <img
                        src={preview || user?.profile_image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">תמונת פרופיל</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {user?.profile_image ? "עדכן את תמונת הפרופיל שלך" : "הוסף תמונת פרופיל לחשבון שלך"}
                  </p>
                  <div className="flex items-center gap-3">
                    <label htmlFor="editProfileImage" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        {user?.profile_image ? "שנה תמונה" : "הוסף תמונה"}
                      </Button>
                    </label>
                    <input
                      id="editProfileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {preview && (
                      <Button
                        onClick={handleConfirmUpload}
                        size="sm"
                        disabled={isUploading}
                      >
                        {isUploading ? "מעלה..." : "שמור תמונה"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone Section */}
              <div className="flex items-start gap-4 py-4 border-t border-gray-100">
                <div className="w-20 flex justify-center pt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">📱</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">מספר טלפון</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {user?.phone ? `מספר הטלפון הנוכחי: ${user.phone}` : "הוסף מספר טלפון לחשבון שלך"}
                  </p>
                  
                  {editingField === "phone" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="הכנס מספר טלפון"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        dir="ltr"
                      />
                      <Button
                        onClick={() => handleUpdateProfile("phone")}
                        size="sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "שומר..." : "שמור"}
                      </Button>
                      <Button
                        onClick={() => setEditingField(null)}
                        variant="outline"
                        size="sm"
                      >
                        ביטול
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => initializeEditForm("phone")}
                      variant="outline"
                      size="sm"
                    >
                      {user?.phone ? "עדכן טלפון" : "הוסף טלפון"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Section */}
              <div className="flex items-start gap-4 py-4 border-t border-gray-100">
                <div className="w-20 flex justify-center pt-1">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">✉️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">כתובת אימייל</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    כתובת האימייל הנוכחית: {user?.email}
                    {user?.is_verified ? (
                      <span className="text-green-600 text-xs mr-2">✓ מאומת</span>
                    ) : (
                      <span className="text-orange-600 text-xs mr-2">⚠ לא מאומת</span>
                    )}
                  </p>
                  
                  {editingField === "email" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="הכנס כתובת אימייל חדשה"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          dir="ltr"
                        />
                        <Button
                          onClick={() => handleUpdateProfile("email")}
                          size="sm"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "שומר..." : "שמור"}
                        </Button>
                        <Button
                          onClick={() => setEditingField(null)}
                          variant="outline"
                          size="sm"
                        >
                          ביטול
                        </Button>
                      </div>
                      <p className="text-xs text-amber-600">
                        ⚠ שינוי כתובת האימייל ידרוש אימות מחדש
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => initializeEditForm("email")}
                      variant="outline"
                      size="sm"
                    >
                      עדכן אימייל
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => setShowReportsModal(true)}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-blue-600"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>דיווח על בעיה</span>
            </div>
            →
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

      {/* User Reports Modal */}
      <UserReportsModal 
        isOpen={showReportsModal} 
        onClose={() => setShowReportsModal(false)} 
      />
    </div>
  );
}
