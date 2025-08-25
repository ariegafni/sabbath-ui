import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

// ממשק לבקשת אירוח
export interface HostingRequest {
  id: string;
  guest_id: string; // ID של האורח
  host_id: string; // ID של המארח
  requested_date: string; // תאריך מבוקש
  message: string; // הודעה מהאורח
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;

  // שדות נוספים למידע על האורח והמארח
  guest_name?: string;
  guest_profile_image?: string;
  host_name?: string;
  host_profile_image?: string;
}

// ממשק ליצירת בקשת אירוח חדשה
export interface CreateHostingRequestRequest {
  host_id: string;
  requested_date: string;
  message: string;
}

// ממשק לעדכון בקשת אירוח
export interface UpdateHostingRequestRequest {
  id: string;
  status?: "accepted" | "rejected" | "cancelled";
  message?: string;
}

// ממשק לתגובה על בקשת אירוח
export interface RespondToHostingRequestRequest {
  id: string;
  status: "accepted" | "rejected";
  response_message?: string;
}

// ממשק לסינון בקשות אירוח
export interface HostingRequestFilters {
  status?: "pending" | "accepted" | "rejected" | "cancelled";
  host_id?: string;
  guest_id?: string;
  date_from?: string;
  date_to?: string;
}

export class HostingRequestService {
  private static baseUrl = createApiUrl("/api/hosting-requests");

  // יצירת בקשת אירוח חדשה
  static async createHostingRequest(
    requestData: CreateHostingRequestRequest
  ): Promise<HostingRequest> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create hosting request");
    }

    return response.json();
  }

  // קבלת בקשת אירוח לפי ID
  static async getHostingRequestById(id: string): Promise<HostingRequest> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch hosting request");
    }

    return response.json();
  }

  // קבלת כל בקשות האירוח של המשתמש הנוכחי (כאורח)
  static async getMyGuestRequests(
    filters?: HostingRequestFilters
  ): Promise<HostingRequest[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.date_from) queryParams.append("date_from", filters.date_from);
    if (filters?.date_to) queryParams.append("date_to", filters.date_to);

    const url = `${this.baseUrl}/my-guest-requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch my guest requests");
    }

    return response.json();
  }

  // קבלת כל בקשות האירוח שהתקבלו אצל המשתמש הנוכחי (כמארח)
  static async getMyHostRequests(
    filters?: HostingRequestFilters
  ): Promise<HostingRequest[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.guest_id) queryParams.append("guest_id", filters.guest_id);
    if (filters?.date_from) queryParams.append("date_from", filters.date_from);
    if (filters?.date_to) queryParams.append("date_to", filters.date_to);

    const url = `${this.baseUrl}/my-host-requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch my host requests");
    }

    return response.json();
  }

  // קבלת כל בקשות האירוח (למנהלים)
  static async getAllHostingRequests(
    filters?: HostingRequestFilters
  ): Promise<HostingRequest[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.host_id) queryParams.append("host_id", filters.host_id);
    if (filters?.guest_id) queryParams.append("guest_id", filters.guest_id);
    if (filters?.date_from) queryParams.append("date_from", filters.date_from);
    if (filters?.date_to) queryParams.append("date_to", filters.date_to);

    const url = `${this.baseUrl}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch all hosting requests");
    }

    return response.json();
  }

  // עדכון בקשת אירוח
  static async updateHostingRequest(
    requestData: UpdateHostingRequestRequest
  ): Promise<HostingRequest> {
    const response = await fetch(`${this.baseUrl}/${requestData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error("Failed to update hosting request");
    }

    return response.json();
  }

  // קבלה או דחייה של בקשת אירוח (על ידי המארח)
  static async respondToHostingRequest(
    responseData: RespondToHostingRequestRequest
  ): Promise<HostingRequest> {
    const response = await fetch(`${this.baseUrl}/${responseData.id}/respond`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      throw new Error("Failed to respond to hosting request");
    }

    return response.json();
  }

  // ביטול בקשת אירוח (על ידי האורח)
  static async cancelHostingRequest(id: string): Promise<HostingRequest> {
    const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
      method: "PUT",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to cancel hosting request");
    }

    return response.json();
  }

  // מחיקת בקשת אירוח
  static async deleteHostingRequest(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete hosting request");
    }
  }

  // קבלת סטטיסטיקות על בקשות אירוח
  static async getHostingRequestStats(): Promise<{
    total_requests: number;
    pending_requests: number;
    accepted_requests: number;
    rejected_requests: number;
    cancelled_requests: number;
    response_rate: number;
    average_response_time_hours: number;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        ...AuthService.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch hosting request stats");
    }

    return response.json();
  }

  // בדיקה אם יש בקשה אירוח פעילה בין שני משתמשים
  static async checkActiveRequest(
    host_id: string,
    guest_id: string
  ): Promise<HostingRequest | null> {
    const response = await fetch(
      `${this.baseUrl}/check-active/${host_id}/${guest_id}`,
      {
        headers: {
          ...AuthService.getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; 
      }
      throw new Error("Failed to check active request");
    }

    return response.json();
  }
}
