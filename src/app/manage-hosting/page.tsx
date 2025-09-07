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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "@/ui/Button";
import EditHostProfileForm from "@/features/host/EditHostProfileForm";
import AvailabilityManagementModal from "@/features/host/LazyAvailabilityManagementModal";
import { HostService } from "@/service/host";
import { HostingRequestService, HostingRequest } from "@/service/HostingRequest";

export default function ManageHostingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [activeHostings, setActiveHostings] = useState(0);
  const [totalGuestsHosted, setTotalGuestsHosted] = useState(0);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    loadHostProfile();
    loadHostingStats();
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

  const loadHostingStats = async () => {
    try {
      const requests = await HostingRequestService.getMyHostRequests();
      const now = new Date();
      
      let active = 0;
      let completed = 0;
      
      requests.forEach((request: HostingRequest) => {
        if (request.status === 'accepted') {
          const requestDate = new Date(request.requested_date);
          const oneDayAfter = new Date(requestDate);
          oneDayAfter.setDate(oneDayAfter.getDate() + 1);
          
          if (now <= oneDayAfter) {
            // אירוח פעיל - התאריך עדיין לא עבר או עבר פחות מיום
            active++;
          } else {
            // אורח שהתארח - עבר יום מתאריך הבקשה
            completed++;
          }
        }
      });
      
      setActiveHostings(active);
      setTotalGuestsHosted(completed);
    } catch (error) {
      console.error("Error loading hosting stats:", error);
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
          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("manageHosting.activeHostings")}
                </p>
                <p className="text-2xl font-bold text-gray-900">{activeHostings}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalGuestsHosted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="w-full md:w-auto flex items-center justify-between"
            >
              <div className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                {t("manageHosting.hostProfile.editHostingDetails")}
              </div>
              {isEditing ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Edit Host Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <EditHostProfileForm
              onSuccess={() => {
                setIsEditing(false);
                loadHostProfile();
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
            loadHostProfile();
          }}
          hostId={hostProfile?.id || ""}
          currentAvailability={{
            is_always_available: hostProfile?.is_always_available ?? true,
            available_dates: hostProfile?.available_dates ?? [],
            busy_dates: hostProfile?.busy_dates ?? [],
          }}
        />
      </div>
    </div>
  );
}
