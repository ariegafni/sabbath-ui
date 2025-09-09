import { AuthUser } from "@/service/auth";
import { UserStatusReason, USER_STATUS_MESSAGES } from "@/shared/types/userStatus";

export interface PermissionCheck {
  allowed: boolean;
  reason?: UserStatusReason;
  message?: string;
}

/**
 * בדיקות הרשאות למשתמשים
 */
export class UserPermissions {
  constructor(private user: AuthUser | null) {}

  /**
   * בדיקה האם המשתמש מחובר
   */
  private isAuthenticated(): PermissionCheck {
    if (!this.user) {
      return {
        allowed: false,
        message: "עליך להתחבר כדי לבצע פעולה זו"
      };
    }
    return { allowed: true };
  }

  /**
   * בדיקה האם האימייל מאומת
   */
  private isEmailVerified(): PermissionCheck {
    if (!this.user?.is_verified) {
      return {
        allowed: false,
        reason: UserStatusReason.EMAIL_NOT_VERIFIED,
        message: USER_STATUS_MESSAGES[UserStatusReason.EMAIL_NOT_VERIFIED]
      };
    }
    return { allowed: true };
  }

  /**
   * בדיקה האם הפרופיל מושלם (כולל תמונת פרופיל)
   */
  private isProfileComplete(): PermissionCheck {
    if (!this.user?.profile_image || this.user.profile_image.trim() === "") {
      return {
        allowed: false,
        reason: UserStatusReason.PROFILE_INCOMPLETE,
        message: "עליך להוסיף תמונת פרופיל כדי לבצע פעולה זו"
      };
    }
    
    // בדיקה נוספת למספר טלפון אם נדרש
    if (!this.user?.phone || this.user.phone.trim() === "") {
      return {
        allowed: false,
        reason: UserStatusReason.PROFILE_INCOMPLETE,
        message: "עליך להוסיף מספר טלפון כדי לבצע פעולה זו"
      };
    }

    return { allowed: true };
  }

  /**
   * בדיקה האם המשתמש מאושר במערכת
   */
  private isUserApproved(): PermissionCheck {
    if (!this.user?.is_approved) {
      return {
        allowed: false,
        reason: this.user?.status_reason || UserStatusReason.GENERAL_BLOCK,
        message: this.user?.status_reason_description || USER_STATUS_MESSAGES[this.user?.status_reason || UserStatusReason.GENERAL_BLOCK]
      };
    }
    return { allowed: true };
  }

  /**
   * בדיקת הרשאה לביצוע פעולות אירוח
   */
  canCreateHosting(): PermissionCheck {
    // בדיקות בסדר הקטריט:
    const authCheck = this.isAuthenticated();
    if (!authCheck.allowed) return authCheck;

    const emailCheck = this.isEmailVerified();
    if (!emailCheck.allowed) return emailCheck;

    const profileCheck = this.isProfileComplete();
    if (!profileCheck.allowed) return profileCheck;

    const approvalCheck = this.isUserApproved();
    if (!approvalCheck.allowed) return approvalCheck;

    return { allowed: true };
  }

  /**
   * בדיקת הרשאה לביצוע בקשות אירוח
   */
  canCreateHostingRequest(): PermissionCheck {
    // אותן בדיקות כמו אירוח
    return this.canCreateHosting();
  }

  /**
   * בדיקת הרשאה לעדכון פרופיל
   */
  canUpdateProfile(): PermissionCheck {
    const authCheck = this.isAuthenticated();
    if (!authCheck.allowed) return authCheck;

    const emailCheck = this.isEmailVerified();
    if (!emailCheck.allowed) return emailCheck;

    return { allowed: true };
  }

  /**
   * בדיקת הרשאה לשליחת הודעות
   */
  canSendMessages(): PermissionCheck {
    const authCheck = this.isAuthenticated();
    if (!authCheck.allowed) return authCheck;

    const emailCheck = this.isEmailVerified();
    if (!emailCheck.allowed) return emailCheck;

    const approvalCheck = this.isUserApproved();
    if (!approvalCheck.allowed) return approvalCheck;

    return { allowed: true };
  }

  /**
   * קבלת הודעת השגיאה המתאימה
   */
  getBlockMessage(): string {
    const hostingCheck = this.canCreateHosting();
    return hostingCheck.message || "לא ניתן לבצע פעולה זו כרגע";
  }

  /**
   * בדיקה האם המשתמש צריך להשלים את הפרופיל
   */
  needsProfileCompletion(): boolean {
    if (!this.user) return false;
    
    return !this.user.profile_image || 
           this.user.profile_image.trim() === "" ||
           !this.user.phone || 
           this.user.phone.trim() === "";
  }

  /**
   * קבלת רשימת הפעולות שהמשתמש צריך לבצע
   */
  getRequiredActions(): string[] {
    const actions: string[] = [];
    
    if (!this.user) {
      actions.push("התחברות למערכת");
      return actions;
    }

    if (!this.user.is_verified) {
      actions.push("אימות כתובת האימייל");
    }

    if (!this.user.profile_image || this.user.profile_image.trim() === "") {
      actions.push("הוספת תמונת פרופיל");
    }

    if (!this.user.phone || this.user.phone.trim() === "") {
      actions.push("הוספת מספר טלפון");
    }

    if (!this.user.is_approved) {
      actions.push("אישור מנהל המערכת");
    }

    return actions;
  }
}

/**
 * Hook לשימוש בהרשאות משתמש
 */
export const createUserPermissions = (user: AuthUser | null) => {
  return new UserPermissions(user);
};