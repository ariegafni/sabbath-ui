"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Camera, Phone, X, Check, ArrowRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function IncompleteProfilePrompt({ 
  isOpen, 
  onClose, 
  onComplete, 
  userInfo 
}: Props) {
  const { t } = useTranslation();
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  if (!isOpen) return null;

  if (showCompleteProfile) {
    // Here you would import and use the profile completion part of MultiStepRegistration
    // For now, we'll show a simple message
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">השלמת פרופיל</h2>
            <p className="text-gray-600 mb-6">
              פונקציונליות השלמת הפרופיל תתווסף כאן
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteProfile(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium"
              >
                חזור
              </button>
              <button
                onClick={onComplete}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium"
              >
                סיים
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">פרופיל לא שלם</h2>
          <p className="text-orange-100 text-sm">
            השלם את הפרופיל שלך כדי לקבל גישה מלאה
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">פרטים בסיסיים</p>
                <p className="text-sm text-gray-600">
                  {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "הושלם"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">תמונת פרופיל</p>
                <p className="text-sm text-orange-600">חסר</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">מספר טלפון</p>
                <p className="text-sm text-orange-600">חסר</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>למה חשוב להשלים את הפרופיל?</strong>
              <br />
              פרופיל שלם נותן לך גישה לכל התכונות, מגביר את האמינות שלך ומשפר את החוויה עבור משתמשים אחרים.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowCompleteProfile(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              השלם עכשיו
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-all duration-200"
            >
              המשך בלי השלמת פרופיל (מוגבל)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}