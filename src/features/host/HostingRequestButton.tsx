"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, MessageSquare } from "lucide-react";
import Button from "@/ui/Button";
import HostingRequestForm from "./HostingRequestForm";

interface HostingRequestButtonProps {
  hostId: string;
  hostName: string;
  hostProfileImage?: string;
  hostAvailability?: {
    is_always_available: boolean;
    available_dates: string[];
    busy_dates?: string[];
  };
  className?: string;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
}

export default function HostingRequestButton({
  hostId,
  hostName,
  hostProfileImage,
  hostAvailability,
  className = "",
  variant = "primary",
  size = "md",
}: HostingRequestButtonProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSuccess = () => {
    // כאן אפשר להוסיף לוגיקה נוספת כמו עדכון המסך או הצגת הודעת הצלחה
    console.log("Hosting request sent successfully!");
  };

  return (
    <>
      <Button
        onClick={handleOpenForm}
        variant={variant}
        size={size}
        className={`flex items-center space-x-2 space-x-reverse ${className}`}
      >
        <Calendar className="w-4 h-4" />
        <span>בקשת אירוח</span>
      </Button>

      {showForm && (
        <HostingRequestForm
          hostId={hostId}
          hostName={hostName}
          hostProfileImage={hostProfileImage}
          hostAvailability={hostAvailability}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

