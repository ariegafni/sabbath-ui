"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import "../i18n/config";
import AuthProvider from "@/Providers/AuthProvider";
import { queryClient } from "./queryClient";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
