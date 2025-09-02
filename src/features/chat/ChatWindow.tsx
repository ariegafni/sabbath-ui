"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Send, ArrowRight, User } from "lucide-react";
import { Conversation, Message, ChatService, socketService } from "@/service";
import { useAuth } from "@/Providers/AuthProvider";

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();

    socketService.joinConversation(conversation.id);
    socketService.on("new_message", handleNewMessage);
    socketService.on("messages_read", handleMessagesRead);

    return () => {
      socketService.leaveConversation(conversation.id);

      socketService.off("new_message", handleNewMessage);
      socketService.off("messages_read", handleMessagesRead);
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await ChatService.getMessages(conversation.id);
      const uniqueMessages = data.filter(
        (message, index, self) =>
          index === self.findIndex((m) => m.id === message.id)
      );
      setMessages(uniqueMessages);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await ChatService.markAsRead(conversation.id);
    } catch (error) {
      console.error("❌ Error marking as read:", error);
    }
  };

  const handleNewMessage = useCallback(
    (data: any) => {

      if (data.conversation_id === conversation.id) {
        const msg = data.message;

        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === msg.id);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = msg;
            return updated;
          }

          const withoutTemp = prev.filter(
            (m) =>
              !(
                m.id.startsWith("temp-") &&
                m.content === msg.content &&
                m.sender_id === msg.sender_id
              )
          );
          const updated = [...withoutTemp, msg];
          return updated;
        });

        if (msg.sender_id !== user?.id) {
          setTimeout(() => markAsRead(), 100);
        }
      }
    },
    [conversation.id, user?.id]
  );


  const handleMessagesRead = useCallback(
    (data: any) => {
      if (data.conversation_id === conversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === user?.id ? { ...msg, is_read: true } : msg
          )
        );
      }
    },
    [conversation.id, user?.id]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: user!.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: false,
      message_type: "text",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      setSending(true);
      await ChatService.sendMessage({
        conversation_id: conversation.id,
        content: tempMessage.content,
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // --- UI ---
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateSeparator = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return t("chat.today", "היום");
  } else if (date.toDateString() === yesterday.toDateString()) {
    return t("chat.yesterday", "אתמול");
  } else {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

const shouldShowDateSeparator = (
  currentMessage: Message,
  previousMessage?: Message
) => {
  if (!previousMessage) return true;
  const currentDate = new Date(currentMessage.created_at).toDateString();
  const previousDate = new Date(previousMessage.created_at).toDateString();
  return currentDate !== previousDate;
};
const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setNewMessage(e.target.value);
};


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            {conversation.other_user_profile_image ? (
              <img
                src={conversation.other_user_profile_image}
                alt={`${conversation.other_user_first_name} ${conversation.other_user_last_name}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {conversation.other_user_first_name}{" "}
                {conversation.other_user_last_name}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender_id === user?.id;
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showDateSeparator = shouldShowDateSeparator(
              message,
              previousMessage
            );

            return (
              <div key={`${message.id}-${index}`}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200">
                      {formatDateSeparator(message.created_at)}
                    </div>
                  </div>
                )}

                <div
                  className={`flex ${
                    isCurrentUser ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        isCurrentUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      <span>{formatMessageTime(message.created_at)}</span>
                      {isCurrentUser && message.is_read && (
                        <span className="text-blue-200">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={handleInputChange}
              placeholder={t("chat.typeMessage", "הקלד הודעה...")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-right"
              rows={1}
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
