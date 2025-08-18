import { createApiUrl } from "../lib/config";
import { AuthService } from "./auth";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: number;
  participant_ids: number[];
  last_message: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  receiver_id: number;
  content: string;
}

export interface CreateThreadRequest {
  participant_ids: number[];
  initial_message?: string;
}

export class MessageService {
  private static baseUrl = createApiUrl("/api/messages");

  // קבלת כל השיחות של המשתמש
  static async getThreads(): Promise<Thread[]> {
    const response = await fetch(`${this.baseUrl}/threads`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch threads");
    }
    return response.json();
  }

  // קבלת הודעות בשיחה ספציפית
  static async getMessagesByThread(threadId: number): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/threads/${threadId}/messages`,
      {
        headers: {
          ...AuthService.getAuthHeaders(),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    return response.json();
  }

  // שליחת הודעה חדשה
  static async sendMessage(messageData: SendMessageRequest): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    return response.json();
  }

  // יצירת שיחה חדשה
  static async createThread(threadData: CreateThreadRequest): Promise<Thread> {
    const response = await fetch(`${this.baseUrl}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(threadData),
    });
    if (!response.ok) {
      throw new Error("Failed to create thread");
    }
    return response.json();
  }

  // סימון הודעה כנקראה
  static async markMessageAsRead(messageId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}/read`, {
      method: "PUT",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to mark message as read");
    }
  }

  // סימון כל ההודעות בשיחה כנקראו
  static async markThreadAsRead(threadId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/threads/${threadId}/read`, {
      method: "PUT",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to mark thread as read");
    }
  }

  // מחיקת הודעה
  static async deleteMessage(messageId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete message");
    }
  }

  // מחיקת שיחה
  static async deleteThread(threadId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/threads/${threadId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete thread");
    }
  }

  // קבלת מספר ההודעות שלא נקראו
  static async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch(`${this.baseUrl}/unread-count`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }
    return response.json();
  }

  // חיפוש הודעות
  static async searchMessages(query: string): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          ...AuthService.getAuthHeaders(),
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to search messages");
    }
    return response.json();
  }

  // קבלת הודעות לפי תאריך
  static async getMessagesByDate(date: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/by-date?date=${date}`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch messages by date");
    }
    return response.json();
  }

  // קבלת הודעות לפי משתמש
  static async getMessagesByUser(userId: number): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/by-user/${userId}`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch messages by user");
    }
    return response.json();
  }
}
