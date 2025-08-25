"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, MessageSquare, Send, X } from "lucide-react";
import Button from "@/ui/Button";
import {
  HostingRequestService,
  CreateHostingRequestRequest,
} from "@/service/HostingRequest";

interface HostingRequestFormProps {
  hostId: string;
  hostName: string;
  hostProfileImage?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function HostingRequestForm({
  hostId,
  hostName,
  hostProfileImage,
  onClose,
  onSuccess,
}: HostingRequestFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requested_date: "",
    message: "",
  });

  // Debug logging
  console.log("🚀 HostingRequestForm props:");
  console.log("  - hostId:", hostId);
  console.log("  - hostName:", hostName);
  console.log("  - hostProfileImage:", hostProfileImage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.requested_date || !formData.message.trim()) {
      alert("אנא מלא את כל השדות הנדרשים");
      return;
    }

    setLoading(true);

    try {
      const requestData: CreateHostingRequestRequest = {
        host_id: hostId,
        requested_date: formData.requested_date,
        message: formData.message.trim(),
      };

      console.log("🚀 Sending hosting request:");
      console.log("  - Host ID:", hostId);
      console.log("  - Request data:", requestData);
      console.log("  - Host ID type:", typeof hostId);
      console.log("  - Host ID length:", hostId?.length);

      await HostingRequestService.createHostingRequest(requestData);

      // הצגת הודעת הצלחה
      alert("בקשת האירוח נשלחה בהצלחה!");

      // קריאה לפונקציה שתסגור את המודל ותעדכן את המסך
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating hosting request:", error);
      alert("שגיאה בשליחת בקשת האירוח. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // קבלת התאריך המינימלי (היום)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">בקשת אירוח</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Host Info */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4 space-x-reverse">
            {hostProfileImage ? (
              <img
                src={hostProfileImage}
                alt={hostName}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white font-bold text-xl">
                  {hostName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {hostName}
              </h3>
              <p className="text-sm text-gray-600">מארח</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              תאריך מבוקש
            </label>
            <div className="relative">
              <Calendar
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="date"
                value={formData.requested_date}
                onChange={(e) =>
                  handleInputChange("requested_date", e.target.value)
                }
                min={getMinDate()}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                required
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
            <p className="text-xs text-gray-500">
              לחץ על השדה כדי לפתוח לוח שנה
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              הודעה למארח
            </label>
            <div className="relative">
              <MessageSquare
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="כתוב הודעה קצרה למארח... (למשל: היי! אני מעוניין להתארח אצלך בתאריך זה...)"
                rows={4}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              {formData.message.length}/500 תווים
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={
                loading || !formData.requested_date || !formData.message.trim()
              }
              className="w-full flex items-center justify-center space-x-2 space-x-reverse"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send size={20} />
              )}
              <span>{loading ? "שולח..." : "שלח בקשת אירוח"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
