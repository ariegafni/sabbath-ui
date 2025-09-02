"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Search, Clock, User, ChevronLeft } from "lucide-react";
import { Conversation, ChatService } from "@/service";
import { socketService } from "@/service";

interface ConversationsListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationsList({
  onConversationSelect,
  selectedConversationId,
}: ConversationsListProps) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const handleNewMessage = (data: any) => {

      setConversations((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((c) => c.id === data.conversation_id);

        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            last_message_content: data.message.content,
            last_message_created_at: data.message.created_at,
            unread_count: (updated[idx].unread_count || 0) + 1,
          };
        } else {
          const newConv = {
            id: data.conversation_id,
            other_user_first_name: data.message.sender_first_name,
            other_user_last_name: data.message.sender_last_name,
            other_user_profile_image: data.message.sender_profile_image,
            last_message_content: data.message.content,
            last_message_created_at: data.message.created_at,
            unread_count: 1,
          } as Conversation;
          updated.unshift(newConv);
        }

        return updated;
      });
    };

    socketService.on("new_message", handleNewMessage);
    return () => {
      socketService.off("new_message", handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(
        (conversation) =>
          `${conversation.other_user_first_name} ${conversation.other_user_last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          conversation.last_message_content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await ChatService.getConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (err) {
      console.error("❌ Error loading conversations:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (errorMessage.includes("fetch")) {
        setError("מערכת הצ'אט אינה זמינה כרגע. אנא נסה שוב מאוחר יותר.");
      } else {
        setError("Failed to load conversations");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatLastMessage = (content?: string) => {
    if (!content) return t("chat.noMessages", "אין הודעות");
    if (content.length > 50) {
      return content.substring(0, 50) + "...";
    }
    return content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <MessageCircle className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadConversations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("chat.searchConversations", "חפש שיחות...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-6">
              <MessageCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? t("chat.noSearchResults", "לא נמצאו תוצאות")
                : t("chat.noConversations", "אין שיחות")}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? t("chat.tryDifferentSearch", "נסה חיפוש אחר")
                : t("chat.startChatting", "התחל לשוחח עם מארחים")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-blue-50 border-r-2 border-r-blue-600"
                    : ""
                }`}
                onClick={() => {
                  onConversationSelect(conversation);
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {conversation.other_user_profile_image ? (
                      <img
                        src={conversation.other_user_profile_image}
                        alt={`${conversation.other_user_first_name} ${conversation.other_user_last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    {conversation.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {conversation.unread_count > 9
                          ? "9+"
                          : conversation.unread_count}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`font-semibold text-gray-900 truncate ${
                          conversation.unread_count > 0 ? "font-bold" : ""
                        }`}
                      >
                        {conversation.other_user_first_name}{" "}
                        {conversation.other_user_last_name}
                      </h4>
                      {conversation.last_message_created_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatTime(conversation.last_message_created_at)}
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conversation.unread_count > 0
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {formatLastMessage(conversation.last_message_content)}
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
