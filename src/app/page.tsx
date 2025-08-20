"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CountriesList from "@/features/countries/CountriesList";
import HostsList from "@/features/hosts/HostsList";
import AuthModal from "@/features/auth/AuthModal";
import Button from "@/ui/Button";
import { User, Plus } from "lucide-react";
import { useAuth } from "@/Providers/AuthProvider";
import { useRouter } from "next/navigation";

type ViewMode = "countries" | "hosts";

export default function HomePage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("countries");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const initials = useMemo(() => {
    if (!user?.name) return "";
    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [user]);

  const handleCountrySelect = (country: { place_id: string }) => {
    setSelectedCountry(country.place_id);
    setViewMode("hosts");
  };

  const handleBackToCountries = () => {
    setViewMode("countries");
    setSelectedCountry("");
  };

  const handleHostSelect = (host: any) => {
    console.log("Selected host:", host);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("app.title")}
              </h1>
              <p className="mt-1 text-gray-600 text-sm sm:text-base">
                מצאו אירוח לשבת או פרסמו ארוחה משלכם
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="hidden sm:flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    התחברות
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    className="hidden sm:flex items-center gap-2"
                  >
                    הרשמה
                  </Button>
                </>
              ) : (
                <>

                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === "countries" ? (
          <CountriesList onCountrySelect={handleCountrySelect} />
        ) : (
          <HostsList
            country={selectedCountry}
            onHostSelect={handleHostSelect}
            onBack={handleBackToCountries}
          />
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </main>
  );
}
