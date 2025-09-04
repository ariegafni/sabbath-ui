"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, X, Plus, Trash2, Check, Ban } from "lucide-react";
import Button from "@/ui/Button";
import { HostService } from "@/service/host";

interface BusyDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hostId: string;
  currentBusyDates?: string[];
  currentAvailability?: {
    is_always_available: boolean;
    available_dates: string[];
  };
}

export default function BusyDatesModal({
  isOpen,
  onClose,
  onSuccess,
  hostId,
  currentBusyDates = [],
  currentAvailability,
}: BusyDatesModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedBusyDates, setSelectedBusyDates] = useState<string[]>(currentBusyDates);

  useEffect(() => {
    setSelectedBusyDates(currentBusyDates);
  }, [currentBusyDates]);

  // פונקציה לחישוב שבתות עד חודשיים קדימה (זהה לרכיב בקשת האירוח)
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
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // אוסף את כל השבתות עד חודשיים קדימה
    while (currentDate <= twoMonthsFromNow) {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, "0");
      const d = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`; // YYYY-MM-DD מקומי

      const formatted = currentDate.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      dates.push({
        value: dateStr,
        label: formatted,
        date: new Date(currentDate),
      });

      currentDate.setDate(currentDate.getDate() + 7); // לשבת הבאה
    }

    return dates;
  };

  // סינון תאריכים לפי זמינות המארח
  const getAvailableSabbaths = () => {
    const allSabbaths = getSabbathDates();
    
    if (!currentAvailability) return allSabbaths;
    
    if (currentAvailability.is_always_available) {
      // אם המארח זמין תמיד, מציג את כל השבתות
      return allSabbaths;
    } else {
      // אם המארח זמין לתאריכים מסוימים, מציג רק את אותם תאריכים
      return allSabbaths.filter(sabbath => 
        currentAvailability.available_dates.includes(sabbath.value)
      );
    }
  };

  const availableSabbaths = getAvailableSabbaths();

  const handleDateToggle = (dateStr: string) => {
    setSelectedBusyDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  const handleClearAll = () => {
    setSelectedBusyDates([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await HostService.updateBusyDates(hostId, {
        busy_dates: selectedBusyDates,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating busy dates:', error);
      alert('שגיאה בעדכון התאריכים התפוסים. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-600 to-pink-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">סמן כתפוס</h2>
            <p className="text-red-100 text-sm">בחר שבתות שבהן לא תוכל לארח אורחים</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Info Box */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Ban className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">איך זה עובד?</h3>
                <p className="text-sm text-amber-800">
                  בחר שבתות שבהן אתה לא זמין לאירוח. התאריכים שתבחר יוסרו מהזמינות שלך ולא יוצגו לאורחים פוטנציאליים.
                </p>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          {currentAvailability && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">סטטוס זמינות נוכחי</h3>
              </div>
              <p className="text-sm text-blue-800">
                {currentAvailability.is_always_available 
                  ? "זמין תמיד - יכול לסמן כל שבת כתפוסה"
                  : `זמין לתאריכים ספציפיים (${currentAvailability.available_dates.length} שבתות)`
                }
              </p>
            </div>
          )}

          {availableSabbaths.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">אין שבתות זמינות</h3>
              <p className="text-gray-600 text-sm">
                לא ניתן לסמן תאריכים כתפוסים כי אין לך שבתות זמינות מוגדרות.
                <br />
                עדכן תחילה את הזמינות שלך.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  נקה הכל
                </Button>
              </div>

              {/* Selected Count */}
              {selectedBusyDates.length > 0 && (
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    נבחרו {selectedBusyDates.length} שבתות כתפוסות
                  </p>
                </div>
              )}

              {/* Date Selection Grid */}
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {availableSabbaths.map((sabbath) => {
                  const isBusy = selectedBusyDates.includes(sabbath.value);
                  return (
                    <label
                      key={sabbath.value}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        isBusy
                          ? 'bg-red-50 border-2 border-red-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isBusy}
                        onChange={() => handleDateToggle(sabbath.value)}
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className={`mr-3 font-medium ${isBusy ? 'text-red-900' : 'text-gray-900'}`}>
                        {sabbath.label}
                      </span>
                      {isBusy && (
                        <Ban className="h-4 w-4 text-red-600 mr-auto" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || availableSabbaths.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2"></div>
              ) : (
                <Check className="h-5 w-5 ml-2" />
              )}
              {loading ? "שומר..." : "שמור שינויים"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}