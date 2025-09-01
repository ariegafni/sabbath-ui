import { io, Socket } from 'socket.io-client';
import { createApiUrl } from '../shared/lib/config';

export interface SocketMessage {
  conversation_id: string;
  message: any;
}

export interface SocketTyping {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
}

export interface SocketMessagesRead {
  conversation_id: string;
  reader_user_id: string;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    const socketUrl = createApiUrl('').replace('/api', '');
    
    this.socket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.emit('connected', null);
    });

    this.socket.on('disconnect', (reason) => {
      this.emit('disconnected', reason);
    });

    this.socket.on('new_message', (data: SocketMessage) => {
      this.emit('new_message', data);
    });

    this.socket.on('user_typing', (data: SocketTyping) => {
      this.emit('user_typing', data);
    });

    this.socket.on('messages_read', (data: SocketMessagesRead) => {
      this.emit('messages_read', data);
    });

    this.socket.on('conversation_updated', (data: any) => {
      this.emit('conversation_updated', data);
    });

    this.socket.on('error', (error) => {
      this.emit('error', error);
    });
  }

  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversation_id: conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversation_id: conversationId });
    }
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { 
        conversation_id: conversationId, 
        is_typing: isTyping 
      });
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  get connected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();