"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Upload,
  X
} from "lucide-react";
import { AuthService } from "@/service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = "basic-info" | "email-verification" | "profile-completion";

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ProfileData {
  phone: string;
  profileImage: File | null;
  profileImagePreview: string;
}

export default function MultiStepRegistration({ isOpen, onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>("basic-info");
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: "",
    profileImage: null,
    profileImagePreview: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!basicInfo.firstName || !basicInfo.lastName || !basicInfo.email || !basicInfo.password) {
      alert("אנא מלא את כל השדות");
      return;
    }

    if (basicInfo.password.length < 6) {
      alert("הסיסמה חייבת להיות לפחות 6 תווים");
      return;
    }

    setLoading(true);
    try {
      // Register with basic info only - user will be marked as incomplete profile
      await AuthService.register({
        first_name: basicInfo.firstName.trim(),
        last_name: basicInfo.lastName.trim(),
        email: basicInfo.email.trim(),
        password: basicInfo.password,
      });
      
      // Move to email verification step
      setCurrentStep("email-verification");
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage = err instanceof Error ? err.message : "שגיאה בהרשמה";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      alert("אנא הכנס את קוד האימות");
      return;
    }

    setLoading(true);
    try {
      await AuthService.verifyEmail(verificationCode);
      setCurrentStep("profile-completion");
    } catch (err) {
      console.error("Email verification failed:", err);
      alert("קוד האימות שגוי או פג תוקף");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    try {
      await AuthService.resendEmailVerification(basicInfo.email);
      alert("נשלח קוד חדש לכתובת המייל שלך");
    } catch (err) {
      console.error("Resend verification failed:", err);
      alert("שגיאה בשליחת הקוד");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("התמונה גדולה מדי. מקסימום 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData({
          ...profileData,
          profileImage: file,
          profileImagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileData({
      ...profileData,
      profileImage: null,
      profileImagePreview: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProfileCompletion = async (skipProfile: boolean = false) => {
    setLoading(true);
    try {
      if (!skipProfile && (profileData.phone || profileData.profileImage)) {
        let profileImageUrl = "";
        
        // Upload profile image if exists
        if (profileData.profileImage) {
          const uploadResult = await AuthService.uploadProfileImage(profileData.profileImage);
          profileImageUrl = uploadResult.url;
        }

        // Update profile with phone and/or image
        await AuthService.updateProfile({
          phone: profileData.phone || undefined,
          profile_image: profileImageUrl || undefined,
        });
      }
      
      // Complete registration and redirect to home
      onComplete();
    } catch (err) {
      console.error("Profile completion failed:", err);
      alert("שגיאה בהשלמת הפרופיל");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "email-verification") {
      setCurrentStep("basic-info");
    } else if (currentStep === "profile-completion") {
      setCurrentStep("email-verification");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm">
        
        {/* Modern Header with Progress */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4" dir="ltr">
              {/* Step indicators */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep === "basic-info" ? "bg-white text-blue-600 shadow-lg" : 
                currentStep === "email-verification" || currentStep === "profile-completion" ? "bg-blue-400 text-white" : "bg-blue-300 text-blue-600"
              }`}>
                1
              </div>
              <div className={`h-1 w-8 rounded transition-all duration-300 ${
                currentStep === "email-verification" || currentStep === "profile-completion" ? "bg-blue-300" : "bg-blue-200"
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep === "email-verification" ? "bg-white text-blue-600 shadow-lg" : 
                currentStep === "profile-completion" ? "bg-blue-400 text-white" : "bg-blue-300/50 text-blue-200"
              }`}>
                2
              </div>
              <div className={`h-1 w-8 rounded transition-all duration-300 ${
                currentStep === "profile-completion" ? "bg-blue-300" : "bg-blue-200"
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep === "profile-completion" ? "bg-white text-blue-600 shadow-lg" : "bg-blue-300/50 text-blue-200"
              }`}>
                3
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">
              {currentStep === "basic-info" && "יצירת חשבון חדש"}
              {currentStep === "email-verification" && "אימות האימייל"}
              {currentStep === "profile-completion" && "השלמת הפרופיל"}
            </h2>
            <p className="text-blue-100 text-sm">
              {currentStep === "basic-info" && "בואו נתחיל עם הפרטים הבסיסיים"}
              {currentStep === "email-verification" && "נשלח קוד אימות לאימייל שלך"}
              {currentStep === "profile-completion" && "תוכל להוסיף תמונה ופרטים נוספים"}
            </p>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === "basic-info" && (
          <div className="px-6 py-6">

            <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">שם פרטי</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={basicInfo.firstName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="שם פרטי"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">שם משפחה</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={basicInfo.lastName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="שם משפחה"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">אימייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={basicInfo.password}
                    onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="לפחות 6 תווים"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    המשך
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Email Verification */}
        {currentStep === "email-verification" && (
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-gray-600 text-lg">שלחנו קוד אימות לכתובת</p>
              <p className="text-blue-600 font-semibold text-lg">{basicInfo.email}</p>
              <p className="text-gray-500 text-sm mt-2">בדוק את תיבת המייל והכנס את הקוד</p>
            </div>

            <form onSubmit={handleEmailVerification} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">קוד אימות</label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-wider"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-4 font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  חזור
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      אמת
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  onClick={resendVerificationCode}
                  disabled={loading}
                >
                  שלח קוד חדש
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Profile Completion */}
        {currentStep === "profile-completion" && (
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">השלם את הפרופיל</h2>
              <p className="text-gray-600 text-sm">
                עוד כמה פרטים ונסיים את ההרשמה
                <br />
                <span className="text-gray-500">השלב הזה אופציונלי</span>
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">תמונת פרופיל</label>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {profileData.profileImagePreview ? (
                      <div className="relative">
                        <img
                          src={profileData.profileImagePreview}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {profileData.profileImagePreview ? "שנה תמונה" : "העלה תמונה"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">מספר טלפון</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="050-123-4567"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => handleProfileCompletion(false)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      השלם רישום
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleProfileCompletion(true)}
                  className="w-full border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  המשך בלי השלמת פרופיל
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}