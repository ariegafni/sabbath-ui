import { createApiUrl } from "../shared/lib/config";
import { AuthService } from "./auth";

export interface ReportProblemRequest {
  subject?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export class GeneralService {
  private static baseUrl = createApiUrl("/api/general");

  static async reportProblem(payload: ReportProblemRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/report-problem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to report problem");
    }
  }
}
