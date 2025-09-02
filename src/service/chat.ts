import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  content: string;
  message_type: "text" | "system";
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
  other_user_id: string;
  other_user_first_name: string;
  other_user_last_name: string;
  other_user_profile_image?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_created_at?: string;
  unread_count: number;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  message_type?: "text" | "system";
}

export interface StartConversationRequest {
  host_id: string;
  guest_id: string;
  accommodation_request_id?: string;
  initial_message?: string;
}

export class ChatService {
  private static baseUrl = createApiUrl("/api/chat");

  // Get all conversations for current user
  static async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${this.baseUrl}/conversations`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return (await res.json()) as Conversation[];
  }

  // Start a new conversation
  static async startConversation(request: StartConversationRequest): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/conversations`, {
      method: "POST",
      headers: { 
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.error || "Failed to start conversation";
      throw new Error(errorMessage);
    }
    return (await res.json()) as Conversation;
  }

  // Get conversation by ID
  static async getConversation(conversationId: string): Promise<Conversation> {
    const res = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return (await res.json()) as Conversation;
  }

  // Get messages for a conversation
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const res = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages?${params}`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    return (await res.json()) as Message[];
  }

  // Send a message
  static async sendMessage(request: SendMessageRequest): Promise<Message> {
    const res = await fetch(`${this.baseUrl}/conversations/${request.conversation_id}/messages`, {
      method: "POST",
      headers: { 
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: request.content,
        message_type: request.message_type || "text"
      }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return (await res.json()) as Message;
  }

  // Mark conversation as read
  static async markAsRead(conversationId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/conversations/${conversationId}/read`, {
      method: "POST",
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to mark as read");
  }

  // Get unread count
  static async getUnreadCount(): Promise<number> {
    const res = await fetch(`${this.baseUrl}/unread-count`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch unread count");
    const data = await res.json();
    return data.unread_count || 0;
  }
}