import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface AdminStats {
  totalUsers: number;
  totalHosts: number;
  totalHostingRequests: number;
  approvedHostings: number;
  pendingRequests: number;
  totalConversations: number;
  totalBlockedUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'host_creation' | 'hosting_request' | 'hosting_approved';
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserReport {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
}

export interface AdminUser {
  email: string;
  role: 'super_admin' | 'admin';
  added_at: string;
}

export class AdminService {
  private static baseUrl = "http://127.0.0.1:3005/api/admin";

  // Check if current user is admin
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/check-admin`, {
        headers: { ...AuthService.getAuthHeaders() },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get admin statistics
  static async getStatistics(): Promise<AdminStats> {
    const res = await fetch(`${this.baseUrl}/statistics`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch admin statistics");
    return (await res.json()) as AdminStats;
  }

  // Get all user reports
  static async getUserReports(): Promise<UserReport[]> {
    const res = await fetch(`${this.baseUrl}/user-reports`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch user reports");
    return (await res.json()) as UserReport[];
  }

  // Update user report status
  static async updateReportStatus(
    reportId: string, 
    status: 'pending' | 'in_progress' | 'resolved',
    adminNotes?: string
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/user-reports/${reportId}`, {
      method: "PUT",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (!res.ok) throw new Error("Failed to update report status");
  }

  // Delete user report
  static async deleteReport(reportId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/user-reports/${reportId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Failed to delete report");
  }

  // Remove user (delete account)
  static async removeUser(userId: string, reason: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("Failed to remove user");
  }

  // Remove host (delete host profile)
  static async removeHost(hostId: string, reason: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/hosts/${hostId}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("Failed to remove host");
  }

  // Get all users for management
  static async getAllUsers(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/users`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return (await res.json());
  }

  // Get all hosts for management
  static async getAllHosts(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/hosts`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch hosts");
    return (await res.json());
  }

  // Send message as system account
  static async sendSystemMessage(userId: string, message: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/send-system-message`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, message }),
    });
    if (!res.ok) throw new Error("Failed to send system message");
  }

  // Report a guest (host only, after confirmed hosting)
  static async reportGuest(guestId: string, subject: string, message: string, requestId?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/report-guest`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guest_id: guestId,
        subject,
        message,
        request_id: requestId
      }),
    });
    if (!res.ok) throw new Error("Failed to report guest");
  }

  // Block a user (replaces removeUser)
  static async blockUser(userId: string, reason: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/users/${userId}/block`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("Failed to block user");
  }

  // Get all blocked users
  static async getBlockedUsers(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/blocked-users`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch blocked users");
    return (await res.json());
  }

  // Unblock a user
  static async unblockUser(email: string, reason?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/blocked-users/${encodeURIComponent(email)}/unblock`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: reason || 'Unblocked by admin' }),
    });
    if (!res.ok) throw new Error("Failed to unblock user");
  }

  // Check if user is blocked
  static async checkUserBlocked(email: string): Promise<{is_blocked: boolean, message?: string}> {
    const res = await fetch(`${this.baseUrl}/check-blocked/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error("Failed to check user status");
    return (await res.json());
  }

  // Report conversations - get messages for a report
  static async getReportConversations(reportId: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/user-reports/${reportId}/conversations`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch report conversations");
    return (await res.json());
  }

  // Add message to report conversation
  static async addReportMessage(reportId: string, message: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/user-reports/${reportId}/conversations`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to add message to report");
  }

  // Mark report conversations as read
  static async markReportAsRead(reportId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/user-reports/${reportId}/mark-read`, {
      method: "POST",
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to mark report as read");
  }

  // Get current user's reports with unread counts
  static async getMyReports(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/my-reports`, {
      headers: { ...AuthService.getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch user reports");
    return (await res.json());
  }

  // Create a new user report
  static async createUserReport(subject: string, message: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/user-reports`, {
      method: "POST",
      headers: {
        ...AuthService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject, message }),
    });
    if (!res.ok) throw new Error("Failed to create user report");
    const data = await res.json();
    return data.report_id;
  }
}