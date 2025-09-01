import { createApiUrl } from "../shared/lib/config";

export interface AuthUser {
  id: string; 
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_image?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_image?: string; // חדש
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export class AuthService {
  private static baseUrl = createApiUrl("/api/auth");

  // התחברות
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log(
      "NEXT_PUBLIC_API_BASE_URL:",
      process.env.NEXT_PUBLIC_API_BASE_URL
    );

    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error("Login failed");
    }
    return response.json();
  }

  // הרשמה
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Registration failed");
    }
    return response.json();
  }

  // התנתקות
  static async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    this.clearTokens();
  }

  // רענון טוקן
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      throw new Error("Token refresh failed");
    }
    const authResponse = await response.json();
    this.setTokens(authResponse.access_token, authResponse.refresh_token);
    return authResponse;
  }

  // אימות אימייל
  static async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error("Email verification failed");
    }
  }

  // שכחתי סיסמה
  static async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("Forgot password request failed");
    }
  }

  // איפוס סיסמה
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!response.ok) {
      throw new Error("Password reset failed");
    }
  }

  // התחברות עם Google
  static async loginWithGoogle(code: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) {
      throw new Error("Google login failed");
    }
    return response.json();
  }

  // שמירת טוקנים
  private static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  // קבלת access token
  private static getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  // קבלת refresh token
  private static getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  // ניקוי טוקנים
  private static clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  // בדיקה אם המשתמש מחובר
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // קבלת headers עם authorization
  static getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
