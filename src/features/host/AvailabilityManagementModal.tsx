"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, X, Plus, Trash2, Check } from "lucide-react";
import Button from "@/ui/Button";
import { HostService } from "@/service/host";

interface AvailabilityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hostId: string;
  currentAvailability?: {
    is_always_available: boolean;
    available_dates: string[];
  };
}

export default function AvailabilityManagementModal({
  isOpen,
  onClose,
  onSuccess,
  hostId,
  currentAvailability,
}: AvailabilityManagementModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState(
    currentAvailability?.is_always_available ?? true
  );
  const [selectedDates, setSelectedDates] = useState<string[]>(
    currentAvailability?.available_dates ?? []
  );
  const [hasConfirmedDates, setHasConfirmedDates] = useState<boolean>(false);

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
      // 6 = שבת
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

  const availableSabbaths = getSabbathDates();

  const handleDateToggle = (dateStr: string) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedDates(availableSabbaths.map(s => s.value));
  };

  const handleClearAll = () => {
    setSelectedDates([]);
    setHasConfirmedDates(false);
  };

  const handleConfirmDates = () => {
    setHasConfirmedDates(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await HostService.updateAvailability(hostId, {
        is_always_available: isAlwaysAvailable,
        available_dates: isAlwaysAvailable ? [] : selectedDates,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('שגיאה בעדכון הזמינות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">ניהול זמינות לאירוח</h2>
            <p className="text-blue-100 text-sm">עדכן את הזמינות שלך לאירוח אורחים</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Always Available Option */}
          <div className="mb-6 p-4 border-2 rounded-xl transition-colors"
               style={{
                 borderColor: isAlwaysAvailable ? '#3b82f6' : '#e5e7eb',
                 backgroundColor: isAlwaysAvailable ? '#eff6ff' : '#ffffff'
               }}>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="availability_type"
                checked={isAlwaysAvailable}
                onChange={() => setIsAlwaysAvailable(true)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500"
              />
              <div className="mr-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  זמין תמיד
                </h3>
                <p className="text-sm text-gray-600">
                  תהיה זמין לאירוח בכל שבת (מומלץ)
                </p>
              </div>
            </label>
          </div>

          {/* Specific Dates Option */}
          <div className="mb-6 p-4 border-2 rounded-xl transition-colors"
               style={{
                 borderColor: !isAlwaysAvailable ? '#3b82f6' : '#e5e7eb',
                 backgroundColor: !isAlwaysAvailable ? '#eff6ff' : '#ffffff'
               }}>
            <label className="flex items-center cursor-pointer mb-4">
              <input
                type="radio"
                name="availability_type"
                checked={!isAlwaysAvailable}
                onChange={() => setIsAlwaysAvailable(false)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500"
              />
              <div className="mr-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  זמין לתאריכים מסוימים
                </h3>
                <p className="text-sm text-gray-600">
                  בחר את השבתות הספציפיות שבהן תוכל לארח
                </p>
              </div>
            </label>

            {!isAlwaysAvailable && (
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    בחר הכל
                  </Button>
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
                {selectedDates.length > 0 && (
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      נבחרו {selectedDates.length} שבתות
                    </p>
                  </div>
                )}

                {/* Date Selection Grid */}
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {availableSabbaths.map((sabbath) => {
                    const isSelected = selectedDates.includes(sabbath.value);
                    return (
                      <label
                        key={sabbath.value}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDateToggle(sabbath.value)}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="mr-3 font-medium text-gray-900">
                          {sabbath.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Confirmation Button for Specific Dates */}
                {selectedDates.length > 0 && !hasConfirmedDates && (
                  <div className="text-center mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 mb-3 font-medium">
                      בחרת {selectedDates.length} שבתות. אנא אשר את הבחירה שלך לפני השמירה.
                    </p>
                    <Button
                      type="button"
                      onClick={handleConfirmDates}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                    >
                      <Check className="h-4 w-4 ml-2" />
                      אשר בחירת תאריכים
                    </Button>
                  </div>
                )}

                {/* Confirmation Success Message */}
                {hasConfirmedDates && selectedDates.length > 0 && (
                  <div className="text-center mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ אישרת {selectedDates.length} שבתות לאירוח
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
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
              disabled={loading || (!isAlwaysAvailable && (selectedDates.length === 0 || !hasConfirmedDates))}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2"></div>
              ) : (
                <Check className="h-5 w-5 ml-2" />
              )}
              {loading ? "שומר..." : "שמור זמינות"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}