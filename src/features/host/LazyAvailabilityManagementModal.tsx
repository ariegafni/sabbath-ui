"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/ui/LoadingSpinner";

const AvailabilityManagementModal = dynamic(() => import("./AvailabilityManagementModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6">
          <LoadingSpinner text="טוען מודל ניהול זמינות..." className="h-64" />
        </div>
      </div>
    </div>
  )
});

export default AvailabilityManagementModal;