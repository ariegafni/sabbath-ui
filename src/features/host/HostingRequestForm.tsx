"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, MessageSquare, Send, X, User } from "lucide-react";
import Button from "@/ui/Button";
import {
  HostingRequestService,
  CreateHostingRequestRequest,
} from "@/service/HostingRequest";
import { useAuth } from "@/Providers/AuthProvider";

interface HostingRequestFormProps {
  hostId: string;
  hostName: string;
  hostProfileImage?: string;
  hostAvailability?: {
    is_always_available: boolean;
    available_dates: string[];
    busy_dates?: string[];
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function HostingRequestForm({
  hostId,
  hostName,
  hostProfileImage,
  hostAvailability,
  onClose,
  onSuccess,
}: HostingRequestFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requested_date: "",
    message: "",
  });

  const getSabbathDates = () => {
    const dates = [];
    const today = new Date();
    const twoMonthsFromNow = new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      today.getDate()
    );

    // מוצא את השבת הקרובה
    const currentDate = new Date(today);
    while (currentDate.getDay() !== 6) {
      // 6 = שבת
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // אוסף את כל השבתות עד חודשיים קדימה
    while (currentDate <= twoMonthsFromNow) {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, "0");
      const d = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`; // YYYY-MM-DD מקומי

      // בדיקה אם התאריך זמין לפי הגדרות המארח
      const isAvailable = !hostAvailability || 
        hostAvailability.is_always_available || 
        hostAvailability.available_dates.includes(dateStr);

      // בדיקה אם התאריך לא תפוס
      const isBusy = hostAvailability?.busy_dates?.includes(dateStr) || false;

      if (isAvailable && !isBusy) {
        const formatted = currentDate.toLocaleDateString("he-IL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        dates.push({
          value: dateStr,
          label: formatted,
        });
      }

      currentDate.setDate(currentDate.getDate() + 7); // לשבת הבאה
    }

    return dates;
  };

  const getRandomProfileGradient = () => {
    const gradients = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requested_date || !formData.message.trim()) {
      alert("אנא מלא את כל השדות הנדרשים");
      return;
    }

    setLoading(true);

    try {
      const requestData: CreateHostingRequestRequest = {
        host: hostId,
        requested_date: formData.requested_date,
        message: formData.message.trim(),
      };
      console.log(requestData);
      await HostingRequestService.createHostingRequest(requestData);

      // Start a conversation with the host
      if (user) {
        // Note: Chat can only be started after host approval of the accommodation request
      }

      alert("בקשת האירוח נשלחה בהצלחה!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating hosting request:", error);
      alert("שגיאה בשליחת בקשת האירוח. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">בקשת אירוח</h2>
            <p className="text-blue-100 text-sm">שלח בקשה למארח</p>
          </div>
        </div>

        {/* Host Profile */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {hostProfileImage ? (
              <img
                src={hostProfileImage}
                alt={hostName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-14 h-14 bg-gradient-to-br ${getRandomProfileGradient()} rounded-full flex items-center justify-center`}
              >
                <User className="text-white w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900">{hostName}</h3>
              <p className="text-sm text-gray-600">מארח מאומת</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              בחר תאריך שבת
            </label>
            <div className="relative">
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={formData.requested_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requested_date: e.target.value,
                  }))
                }
                className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right appearance-none bg-white"
                required
              >
                <option value="">בחר תאריך שבת...</option>
                {getSabbathDates().map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              זמינות לשבתות בלבד עד חודשיים קדימה
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              הודעה ל{hostName}
            </label>
            <div className="relative">
              <MessageSquare className="absolute right-4 top-4 text-gray-400 h-5 w-5" />
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder={`ספר ל${hostName} על עצמך ועל הביקור המתוכנן...`}
                rows={4}
                maxLength={500}
                className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.message.length}/500 תווים
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={
              loading || !formData.requested_date || !formData.message.trim()
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
            {loading ? "שולח..." : "שלח בקשה"}
          </Button>
        </form>
      </div>
    </div>
  );
}
