"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/Providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Conversation, socketService, ChatService } from "@/service";
import { AuthService } from "@/service/auth";
import ConversationsList from "@/features/chat/ConversationsList";
import ChatWindow from "@/features/chat/ChatWindow";

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check if token exists
    const token = AuthService.getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    // Connect to socket (if chat service is available)
    if (token) {
      try {
        socketService.connect(token);
      } catch (error) {
        console.warn("Socket connection failed - chat will work in basic mode:", error);
      }
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      socketService.disconnect();
    };
  }, [user, router]);

  // Handle conversation parameter from URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && user && !selectedConversation) {
      // Auto-select the conversation from URL parameter
      loadAndSelectConversation(conversationId);
    }
  }, [searchParams, user, selectedConversation]);

  const loadAndSelectConversation = async (conversationId: string) => {
    try {
      const conversation = await ChatService.getConversation(conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error("Failed to load conversation from URL:", error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("auth.loginRequired", "נדרשת התחברות")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("auth.loginRequiredMessage", "עליך להתחבר כדי לצפות בהודעות")}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("auth.login", "התחבר")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white pb-20" dir="rtl">
      {/* Desktop Layout */}
      {!isMobile ? (
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">
                {t("messages.title")}
              </h1>
            </div>
            <ConversationsList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="flex-1">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={handleBackToList}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-300 mb-6">
                    <MessageCircle className="h-20 w-20 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("chat.selectConversation", "בחר שיחה")}
                  </h3>
                  <p className="text-gray-600">
                    {t("chat.selectConversationDescription", "בחר שיחה כדי להתחיל לכתב")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mobile Layout */
        <div className="h-full">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={handleBackToList}
            />
          ) : (
            <div>
              <div className="p-4 border-b border-gray-200 bg-white">
                <h1 className="text-xl font-bold text-gray-900">
                  {t("messages.title")}
                </h1>
              </div>
              <ConversationsList
                onConversationSelect={handleConversationSelect}
                selectedConversationId={selectedConversation?.id}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
