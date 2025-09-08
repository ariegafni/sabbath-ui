"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Github } from "lucide-react";
import Button from "@/ui/Button";
import { AuthService } from "../../service";
import MultiStepRegistration from "./MultiStepRegistration";

type AuthMode = "login" | "forgot-password";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
};

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMultiStepRegistration, setShowMultiStepRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  if (!isOpen) return null;

  // Show multi-step registration when requested
  if (showMultiStepRegistration) {
    return (
      <MultiStepRegistration
        isOpen={isOpen}
        onClose={onClose}
        onComplete={() => {
          setShowMultiStepRegistration(false);
          onClose();
          // Here you might want to trigger a page refresh or redirect to dashboard
          window.location.reload();
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const authResponse = await AuthService.login({
          email: formData.email,
          password: formData.password,
        });

        // Store tokens and user data
        localStorage.setItem("access_token", authResponse.access_token);
        localStorage.setItem("refresh_token", authResponse.refresh_token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));
        onClose();
        // TODO: Update auth context
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("שגיאה בתקשורת עם השרת");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // TODO: Implement Google OAuth
    alert("אימות עם גוגל - בקרוב");
  };

  const handleFacebookAuth = async () => {
    // TODO: Implement Facebook OAuth
    alert("אימות עם פייסבוק - בקרוב");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "login" && "התחברות"}
            {mode === "forgot-password" && "איפוס סיסמה"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">אימייל</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="הכנס את האימייל שלך"
              />
            </div>
          </div>


          {mode !== "forgot-password" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="הכנס את הסיסמה שלך"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              <>
                {mode === "login" && "התחבר"}
                {mode === "forgot-password" && "שלח קוד איפוס"}
              </>
            )}
          </Button>

          {/* Social Auth */}
          {mode === "login" && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">או</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">גוגל</span>
                </button>
                <button
                  type="button"
                  onClick={handleFacebookAuth}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">פייסבוק</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-center">
          {mode === "login" && (
            <div className="space-y-2">
              <button
                onClick={() => setMode("forgot-password")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                שכחת סיסמה?
              </button>
              <div className="text-sm text-gray-600">
                אין לך חשבון?{" "}
                <button
                  onClick={() => setShowMultiStepRegistration(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  הירשם עכשיו
                </button>
              </div>
            </div>
          )}


          {mode === "forgot-password" && (
            <div className="text-sm text-gray-600">
              זכרת את הסיסמה?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                חזור להתחברות
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
