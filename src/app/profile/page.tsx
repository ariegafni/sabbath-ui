"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Providers/AuthProvider";
import { User, Settings, LogOut, Bell, Star, Edit3 } from "lucide-react";
import Button from "@/ui/Button";
import { HostService } from "@/service";

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

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
          <p className="text-gray-600">שגיאה בטעינת הפרופיל</p>
          <Button onClick={fetchProfile} className="mt-4">
            נסה שוב
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
            <h1 className="text-2xl font-bold text-gray-900">הפרופיל שלי</h1>
            <Button
              onClick={() => setShowEditForm(!showEditForm)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              ערוך
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
                  <span className="font-medium">אימייל:</span>
                  <span>{profile.email}</span>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">טלפון:</span>
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.bio && (
                  <div className="mt-3">
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>

              {/* User Stats */}
              {profile.stats && (
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.total_hostings || 0}
                    </div>
                    <div className="text-sm text-gray-600">אירוחים</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                      <Star className="h-6 w-6 fill-current" />
                      {profile.rating || 0}
                    </div>
                    <div className="text-sm text-gray-600">דירוג</div>
                  </div>
                </div>
              )}

              {/* Settings Display */}
              {profile.settings && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    הגדרות
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">שפה:</span>{" "}
                      {profile.settings.language === "he"
                        ? "עברית"
                        : profile.settings.language}
                    </div>
                    <div>
                      <span className="font-medium">אזור זמן:</span>{" "}
                      {profile.settings.timezone}
                    </div>
                    <div>
                      <span className="font-medium">התראות אימייל:</span>{" "}
                      {profile.settings.email_notifications
                        ? "פעיל"
                        : "לא פעיל"}
                    </div>
                    <div>
                      <span className="font-medium">התראות דחיפה:</span>{" "}
                      {profile.settings.push_notifications ? "פעיל" : "לא פעיל"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות</h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">הגדרות חשבון</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">התראות</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">פרטיות</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            פעולות חשבון
          </h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-red-600">
              <div className="flex items-center gap-3">
                <span>דיווח על בעיה</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-red-600">
              <div className="flex items-center gap-3">
                <span>מחק חשבון</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              התנתקות
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
