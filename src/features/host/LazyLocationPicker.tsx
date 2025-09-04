"use client";

import dynamic from "next/dynamic";
import LoadingSpinner from "@/ui/LoadingSpinner";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false, // Disable SSR since Google Maps requires client-side
  loading: () => <LoadingSpinner text="טוען בוחר מיקום..." className="h-32" />
});

export default LocationPicker;