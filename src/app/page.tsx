"use client";
import GuestCardsList from "@/features/guestCards/GuestCardsList";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center sm:text-right bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("app.title")}
          </h1>
          <p className="mt-2 text-gray-600 text-center sm:text-right text-sm sm:text-base">
            מצאו אירוח לשבת או פרסמו ארוחה משלכם
          </p>
        </div>
        <GuestCardsList />
      </div>
    </main>
  );
}
