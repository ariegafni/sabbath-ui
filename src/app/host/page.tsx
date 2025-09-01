"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import BecomeHostForm, { HostFormData } from "@/features/host/BecomeHostForm";
import Button from "@/ui/Button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { HostService } from "../../service";

export default function HostPage() {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: HostFormData) => {
    setLoading(true);
    try {
      await HostService.createHost({
        country_place_id: data.country_place_id,
        city_place_id: data.city_place_id,
        area: data.area || undefined,
        max_guests: data.max_guests,
        hosting_type: data.hosting_type,
        languages: data.languages,
        kashrut_level: data.kashrut_level || undefined,
        bio: data.bio || undefined,
        photo: data.photo,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to create host:", err);
      alert(t("common.serverError"));
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("host.success.title")}
          </h1>
          <p className="text-gray-600 mb-6">{t("host.success.description")}</p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            {t("host.success.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              className="p-2"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("publish.title")}
              </h1>
              <p className="text-gray-600 text-sm">
                {t("host.header.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <BecomeHostForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
