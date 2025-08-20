"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
  Calendar,
  MapPin,
  Star,
  Edit3,
} from "lucide-react";
import Button from "@/ui/Button";
import { UserServiceMock as UserService } from "../../mock";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  phone?: string;
  is_host: boolean;
  total_hostings?: number;
  rating?: number;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await UserService.getCurrentUser();
      setProfile({
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        photo_url: data.profile_image,
        bio: data.bio,
        phone: data.phone,
        is_host: data.hostProfile?.isHost || false,
        total_hostings: data.hostProfile?.totalGuests || 0,
        rating: data.hostProfile?.rating || 0,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
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

              {/* Host Stats */}
              {profile.is_host && (
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.total_hostings || 0}
                    </div>
                    <div className="text-sm text-gray-600">אירוחים</div>
                  </div>

                  {profile.rating && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                        <Star className="h-6 w-6 fill-current" />
                        {profile.rating}
                      </div>
                      <div className="text-sm text-gray-600">דירוג</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => (window.location.href = "/messages")}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <MessageCircle className="h-6 w-6" />
            <span>הודעות</span>
          </Button>

          {profile.is_host ? (
            <Button
              onClick={() => {
                /* TODO: Navigate to host management */
              }}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>ניהול אירוחים</span>
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = "/host")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <MapPin className="h-6 w-6" />
              <span>פרסם אירוח</span>
            </Button>
          )}
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
