"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, X, Plus, Trash2, Check, Ban } from "lucide-react";
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
    busy_dates?: string[];
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
  const [busyDates, setBusyDates] = useState<string[]>(
    currentAvailability?.busy_dates ?? []
  );
  const [activeTab, setActiveTab] = useState<'availability' | 'busy'>('availability');

  // עדכון מצב המרכיב כאשר נתוני הזמינות משתנים
  useEffect(() => {
    if (currentAvailability) {
      setIsAlwaysAvailable(currentAvailability.is_always_available);
      setSelectedDates(currentAvailability.available_dates);
      setBusyDates(currentAvailability.busy_dates ?? []);
    }
  }, [currentAvailability]);

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
  };

  const handleBusyDateToggle = (dateStr: string) => {
    setBusyDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  const handleClearAllBusy = () => {
    setBusyDates([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // שמירת זמינות רגילה
      await HostService.updateAvailability(hostId, {
        is_always_available: isAlwaysAvailable,
        available_dates: isAlwaysAvailable ? [] : selectedDates,
      });
      
      // שמירת תאריכים תפוסים
      await HostService.updateBusyDates(hostId, {
        busy_dates: busyDates,
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
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'availability'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">זמינות כללית</span>
            </button>
            <button
              onClick={() => setActiveTab('busy')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'busy'
                  ? 'border-b-2 border-red-500 text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Ban className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">תאריכים תפוסים</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'availability' ? (
            <div>
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


              </div>
            )}
          </div>
            </div>
          ) : (
            // Busy Dates Tab
            <div>
              {/* Info Box */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Ban className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">תאריכים תפוסים</h3>
                    <p className="text-sm text-amber-800">
                      בחר שבתות שבהן אתה לא זמין לאירוח. התאריכים האלה יוסרו מהזמינות שלך.
                    </p>
                  </div>
                </div>
              </div>

              {/* Get available dates for busy selection */}
              {(() => {
                const availableDatesForBusy = isAlwaysAvailable 
                  ? availableSabbaths // If always available, can mark any date as busy
                  : availableSabbaths.filter(s => selectedDates.includes(s.value)); // Only selected dates

                if (availableDatesForBusy.length === 0 && !isAlwaysAvailable) {
                  return (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">אין שבתות זמינות</h3>
                      <p className="text-gray-600 text-sm">
                        לא ניתן לסמן תאריכים כתפוסים כי אין לך שבתות זמינות.
                        <br />
                        עבור לטאב "זמינות כללית" כדי להגדיר זמינות.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Quick Actions */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllBusy}
                        className="text-xs"
                      >
                        <Trash2 className="h-4 w-4 ml-1" />
                        נקה הכל
                      </Button>
                    </div>

                    {/* Selected Count */}
                    {busyDates.length > 0 && (
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800">
                          נבחרו {busyDates.length} שבתות תפוסות
                        </p>
                      </div>
                    )}

                    {/* Date Selection Grid */}
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                      {availableDatesForBusy.map((sabbath) => {
                        const isBusy = busyDates.includes(sabbath.value);
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
                              onChange={() => handleBusyDateToggle(sabbath.value)}
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
                );
              })()}
            </div>
          )}
        </div>

                {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-white">
          {/* Error message when no dates selected */}
          {!isAlwaysAvailable && selectedDates.length === 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 text-center">
                ❌ אנא בחר לפחות שבת אחת לאירוח
              </p>
            </div>
          )}
          
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
              disabled={loading || (!isAlwaysAvailable && selectedDates.length === 0)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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