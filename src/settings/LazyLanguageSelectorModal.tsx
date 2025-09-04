"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/ui/LoadingSpinner";

const LanguageSelectorModal = dynamic(() => import("./LanguageSelectorModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <LoadingSpinner text="טוען בחירת שפה..." className="h-32" />
        </div>
      </div>
    </div>
  )
});

export default LanguageSelectorModal;