"use client";

import { X, AlertTriangle, User, Phone, Mail, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BlockedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  requiredActions: string[];
  canGoToProfile?: boolean;
}

export default function BlockedActionModal({
  isOpen,
  onClose,
  title,
  message,
  requiredActions,
  canGoToProfile = true
}: BlockedActionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToProfile = () => {
    onClose();
    router.push("/profile");
  };

  const getActionIcon = (action: string) => {
    if (action.includes("תמונת פרופיל")) return <User className="h-4 w-4" />;
    if (action.includes("טלפון")) return <Phone className="h-4 w-4" />;
    if (action.includes("אימייל")) return <Mail className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {title}
            </h2>
            <p className="text-orange-100 text-sm">
              פעולה זו לא זמינה כעת
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* Required Actions */}
          {requiredActions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                פעולות נדרשות:
              </h3>
              <div className="space-y-2">
                {requiredActions.map((action, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="text-orange-500">
                      {getActionIcon(action)}
                    </div>
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {canGoToProfile && (
              <button
                onClick={handleGoToProfile}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                עבור לפרופיל
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-all duration-200"
            >
              הבנתי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}