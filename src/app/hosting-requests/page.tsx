"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
import HostingRequestsList from "@/features/host/HostingRequestsList";
import MyHostingRequests from "@/features/host/MyHostingRequests";

export default function HostingRequestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("received");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ניהול בקשות אירוח
        </h1>
        <p className="text-gray-600">
          צפה וניהול בקשות האירוח שלך כמארח וכאורח
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="received" className="text-lg py-3">
            בקשות שהתקבלו
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-lg py-3">
            בקשות שנשלחו
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <HostingRequestsList />
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <MyHostingRequests />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
