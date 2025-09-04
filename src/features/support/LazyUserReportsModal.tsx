"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/ui/LoadingSpinner";

const UserReportsModal = dynamic(() => import("./UserReportsModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <LoadingSpinner text="טוען מודל דוחות..." className="h-40" />
        </div>
      </div>
    </div>
  )
});

export default UserReportsModal;