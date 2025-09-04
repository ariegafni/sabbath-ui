"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/ui/LoadingSpinner";

const PostApprovalModal = dynamic(() => import("./PostApprovalModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/50" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          <LoadingSpinner text="טוען מודל אישור..." className="h-32" />
        </div>
      </div>
    </div>
  )
});

export default PostApprovalModal;