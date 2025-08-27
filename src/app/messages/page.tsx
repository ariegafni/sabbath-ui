"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, User, Calendar, MapPin } from "lucide-react";
import Button from "@/ui/Button";
import { MessageService } from "../../service";

type ChatThread = {
  id: number;
  host_id: number;
  guest_id: number;
  host_name: string;
  guest_name: string;
  host_photo?: string;
  guest_photo?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  hosting_request_id?: number;
};

export default function MessagesPage() {
  const { t } = useTranslation();
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);

  useEffect(() => {
    fetchChatThreads();
  }, []);

  const fetchChatThreads = async () => {
    try {
      setLoading(true);
      const data = await MessageService.getThreads();
      // Transform the data to match the local interface
      const transformedThreads = data.map((thread) => ({
        id: thread.id,
        host_id: thread.participant_ids[0],
        guest_id: thread.participant_ids[1],
        host_name: t("messages.host"), // TODO: Get actual names from participants
        guest_name: t("messages.guest"), // TODO: Get actual names from participants
        last_message: thread.last_message.content,
        last_message_at: thread.last_message.created_at,
        unread_count: thread.unread_count,
        hosting_request_id: 1, // TODO: Link to actual hosting request
      }));
      setChatThreads(transformedThreads);
    } catch (error) {
      console.error("Failed to fetch chat threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return t("common.yesterday");
    } else {
      return date.toLocaleDateString("he-IL");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedThread) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSelectedThread(null)}
                variant="ghost"
                className="p-2"
              >
                ←
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h1 className="font-medium text-gray-900">
                    {selectedThread.host_name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t("messages.activeChat")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {t("messages.chatWith", { name: selectedThread.host_name })}
              </p>
              <p className="text-sm mt-2">{t("common.comingSoon")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("messages.title")}
          </h1>
          <p className="text-gray-600 text-sm">{t("messages.subtitle")}</p>
        </div>
      </div>

      {/* Chat Threads */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {chatThreads.length > 0 ? (
          <div className="space-y-3">
            {chatThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">
                        {thread.host_name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(thread.last_message_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {thread.last_message}
                    </p>

                    {/* Request Info */}
                    {thread.hosting_request_id && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {t("messages.requestNumber", {
                            id: thread.hosting_request_id,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {thread.unread_count > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {thread.unread_count > 99 ? "99+" : thread.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("messages.empty.title")}
            </h3>
            <p className="text-gray-500">{t("messages.empty.description")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
