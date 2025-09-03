"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  MessageSquare,
  Clock,
  Edit,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Button from "@/ui/Button";
import EditHostProfileForm from "@/features/host/EditHostProfileForm";
import AvailabilityManagementModal from "@/features/host/AvailabilityManagementModal";
import { HostService } from "@/service/host";

export default function ManageHostingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [isUpdatingOccupied, setIsUpdatingOccupied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadHostProfile();
    setLoading(false);
  }, [user, router]);

  const loadHostProfile = async () => {
    try {
      const profile = await HostService.getCurrentUserHostProfile();
      setHostProfile(profile);
    } catch (error) {
      console.error("Error loading host profile:", error);
    }
  };

  const handleToggleOccupied = async () => {
    if (!hostProfile) return;
    
    setIsUpdatingOccupied(true);
    try {
      let updatedProfile;
      
      if (hostProfile.is_occupied_for_shabbat) {
        // אם הוא כבר מסומן כתפוס, נבטל את הסימון
        updatedProfile = await HostService.unmarkOccupied();
      } else {
        // אם הוא לא מסומן כתפוס, נסמן אותו כתפוס לשבת הקרובה
        updatedProfile = await HostService.markOccupiedForUpcomingShabbat();
      }
      
      setHostProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating occupied status:", error);
      alert("שגיאה בעדכון הסטטוס. אנא נסה שוב.");
    } finally {
      setIsUpdatingOccupied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("manageHosting.title")}
              </h1>
              <p className="text-gray-600 text-sm">
                {t("manageHosting.subtitle")}
              </p>
            </div>
            {/* Removed add hosting button per request */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("manageHosting.activeHostings")}
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("manageHosting.guestsHosted")}
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Availability Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("manageHosting.availability.title")}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t("manageHosting.availability.description")}
            </p>
            <Button
              onClick={() => setShowAvailabilityModal(true)}
              variant="outline"
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              ניהול זמינות
            </Button>
          </div>

          {/* Hosting Requests */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("manageHosting.requests.title")}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t("manageHosting.requests.description")}
            </p>
            <Button
              onClick={() => router.push("/manage-hosting/hosting-requests")}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("manageHosting.requests.cta")}
            </Button>
          </div>

          {/* Occupied Status Toggle */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                hostProfile?.is_occupied_for_shabbat 
                  ? 'bg-red-100' 
                  : 'bg-orange-100'
              }`}>
                {hostProfile?.is_occupied_for_shabbat ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {hostProfile?.is_occupied_for_shabbat ? "מסומן כתפוס" : "סימון כתפוס"}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {hostProfile?.is_occupied_for_shabbat 
                ? `תפוס לשבת ${hostProfile.occupied_shabbat_date ? new Date(hostProfile.occupied_shabbat_date).toLocaleDateString('he-IL') : 'הקרובה'}`
                : "סמן את עצמך כתפוס לשבת הקרובה"
              }
            </p>
            <Button
              onClick={handleToggleOccupied}
              disabled={isUpdatingOccupied}
              variant={hostProfile?.is_occupied_for_shabbat ? "outline" : "primary"}
              className="w-full"
            >
              {isUpdatingOccupied ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : hostProfile?.is_occupied_for_shabbat ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {hostProfile?.is_occupied_for_shabbat ? "בטל סימון תפוס" : "סמן כתפוס"}
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("common.recentActivity")}
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">{t("common.noActivity")}</p>
            <p className="text-sm text-gray-400">
              {t("manageHosting.activity.placeholder")}
            </p>
          </div>
        </div>

        {/* Profile Management */}
       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
  <div className="flex items-center justify-between">
    <Button
      onClick={() => setIsEditing(true)}
      variant="outline"
      className="w-full md:w-auto"
    >
      <Edit className="h-4 w-4 mr-2" />
      {t("manageHosting.hostProfile.editHostingDetails")}
    </Button>
  </div>
</div>


        {/* Edit Host Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <EditHostProfileForm
              onSuccess={() => {
                setIsEditing(false);
                loadHostProfile(); // רענון הנתונים אחרי עדכון מוצלח
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        )}

        {/* Availability Management Modal */}
        <AvailabilityManagementModal
          isOpen={showAvailabilityModal}
          onClose={() => setShowAvailabilityModal(false)}
          onSuccess={() => {
            setShowAvailabilityModal(false);
            loadHostProfile(); // רענון הנתונים אחרי עדכון מוצלח
          }}
          hostId={hostProfile?.id || ''}
          currentAvailability={{
            is_always_available: hostProfile?.is_always_available ?? true,
            available_dates: hostProfile?.available_dates ?? []
          }}
        />
      </div>
    </div>
  );
}
