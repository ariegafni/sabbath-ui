"use client";

import { X, AlertCircle, Mail, Phone, User } from "lucide-react";
import { UserStatusReason, USER_STATUS_MESSAGES } from "../shared/types/userStatus";
import Button from "./Button";

interface UnauthorizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: UserStatusReason;
  customMessage?: string;
}

export default function UnauthorizedModal({
  isOpen,
  onClose,
  reason,
  customMessage,
}: UnauthorizedModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (reason) {
      case UserStatusReason.EMAIL_NOT_VERIFIED:
        return <Mail className="h-16 w-16 text-red-500" />;
      case UserStatusReason.PHONE_NOT_VERIFIED:
        return <Phone className="h-16 w-16 text-red-500" />;
      case UserStatusReason.PROFILE_INCOMPLETE:
        return <User className="h-16 w-16 text-red-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (reason) return USER_STATUS_MESSAGES[reason];
    return "לא ניתן לבצע פעולה זו כרגע. ניתן ליצור קשר מדף הפרופיל";
  };

  const getTitle = () => {
    switch (reason) {
      case UserStatusReason.EMAIL_NOT_VERIFIED:
        return "נדרש אימות אימייל";
      case UserStatusReason.PHONE_NOT_VERIFIED:
        return "נדרש אימות מספר טלפון";
      case UserStatusReason.PROFILE_INCOMPLETE:
        return "פרופיל לא שלם";
      default:
        return "פעולה לא מורשית";
    }
  };

  const getActionButton = () => {
    switch (reason) {
      case UserStatusReason.EMAIL_NOT_VERIFIED:
        return (
          <Button
            onClick={() => {
              // כאן ניתן להוסיף לוגיקה לשליחת מייל אימות
              onClose();
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            שלח מייל אימות מחדש
          </Button>
        );
      case UserStatusReason.PHONE_NOT_VERIFIED:
        return (
          <Button
            onClick={() => {
              // כאן ניתן להוסיף לוגיקה לאימות טלפון
              onClose();
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            אמת מספר טלפון
          </Button>
        );
      case UserStatusReason.PROFILE_INCOMPLETE:
        return (
          <Button
            onClick={() => {
              // נווט לדף הפרופיל
              window.location.href = "/profile";
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            השלם פרופיל
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => {
              // נווט לדף הפרופיל
              window.location.href = "/profile";
            }}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white"
          >
            פרופיל אישי
          </Button>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-6 text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 flex justify-center">
              {getIcon()}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {getTitle()}
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {getMessage()}
            </p>

            {/* Action Button */}
            <div className="flex flex-col space-y-3">
              {getActionButton()}
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                סגור
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}