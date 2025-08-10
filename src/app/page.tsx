"use client";
import GuestCardsList from "@/features/guestCards/GuestCardsList";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("app.title")}</h1>
      <div className="flex gap-3">
      </div>
      <GuestCardsList />
    </main>
  );
}
