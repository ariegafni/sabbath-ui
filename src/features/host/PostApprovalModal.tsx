"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Calendar, X, Ban } from "lucide-react";
import Button from "@/ui/Button";
import { HostService } from "@/service/host";

interface PostApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hostId: string;
  requestDate: string;
  guestName: string;
}

export default function PostApprovalModal({
  isOpen,
  onClose,
  onSuccess,
  hostId,
  requestDate,
  guestName,
}: PostApprovalModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateStr;
    }
  };

  const handleSetBusy = async () => {
    setLoading(true);
    try {
      await HostService.setHostBusyForDate(hostId, requestDate);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error setting host busy:', error);
      alert('שגיאה בעדכון הסטטוס. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSuccess?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">בקשה אושרה בהצלחה!</h2>
            <p className="text-green-100 text-sm">האירוח עם {guestName} מאושר</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              האם להסיר מזמינות?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              מכיוון שאישרת בקשה לשבת <strong>{formatDate(requestDate)}</strong>,
              האם ברצונך לסמן את עצמך כתפוס לאותה שבת?
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Ban className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-right">
                  <p className="text-sm text-blue-900 font-medium mb-1">מה זה אומר?</p>
                  <p className="text-xs text-blue-800">
                    אם תבחר "כן", לא תוכל לקבל בקשות נוספות לאותה שבת.
                    תוכל תמיד לשנות זאת בניהול התאריכים התפוסים.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              לא, השאר זמין
            </Button>
            <Button
              onClick={handleSetBusy}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2"></div>
              ) : (
                <Ban className="h-4 w-4 ml-2" />
              )}
              {loading ? "מסמן..." : "כן, סמן כתפוס"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}