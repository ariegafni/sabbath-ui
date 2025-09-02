import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_profile_image?: string;
}

export interface Conversation {
  id: string;
  host_id: string;
  guest_id: string;
  accommodation_request_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_user_id?: string;
  other_user_first_name?: string;
  other_user_last_name?: string;
  other_user_profile_image?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_created_at?: string;
  unread_count?: number;
}

export interface SendMessageRequest {
  content: string;
  message_type?: string;
}

export interface StartConversationRequest {
  host_id: string;
  guest_id: string;
  accommodation_request_id?: string;
  initial_message?: string;
}

export class ChatService {
  private static baseUrl = createApiUrl("/api/chat");

  // קבלת כל השיחות של המשתמש
  static async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${this.baseUrl}/conversations`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  }

  // יצירת שיחה חדשה
  static async startConversation(
    data: StartConversationRequest
  ): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to start conversation");
    return res.json();
  }

  // קבלת פרטי שיחה
  static async getConversation(id: string): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/conversations/${id}`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  }

  // קבלת הודעות בשיחה
  static async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const res = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      { headers: { ...AuthService.getAuthHeaders() } }
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  }

  // שליחת הודעה בשיחה
  static async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<Message> {
    const res = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  }

  // סימון כל ההודעות בשיחה כנקראו
  static async markConversationAsRead(conversationId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/read`,
      {
        method: "POST",
        headers: { ...AuthService.getAuthHeaders() },
      }
    );
    if (!res.ok) throw new Error("Failed to mark messages as read");
  }

  // קבלת מספר ההודעות שלא נקראו
  static async getUnreadCount(): Promise<{ unread_count: number }> {
    const res = await fetch(`${this.baseUrl}/unread-count`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch unread count");
    return res.json();
  }
}
