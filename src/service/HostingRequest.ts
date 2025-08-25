import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface HostingRequest {
  id: string;
  guest_id: string;
  host_id: string;
  requested_date: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  created_at: string;
  updated_at: string;
  guest_name?: string;
  guest_profile_image?: string;
  host_name?: string;
  host_profile_image?: string;
}

export interface CreateHostingRequestRequest {
  host_id: string;
  requested_date: string;
  message: string;
}

export interface HostingRequestFilters {
  status?: "pending" | "accepted" | "rejected" | "cancelled";
  host_id?: string;
  guest_id?: string;
  date_from?: string;
  date_to?: string;
}

export class HostingRequestService {
  private static baseUrl = createApiUrl("/api/hosting-requests");

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
}
