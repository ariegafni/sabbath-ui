export enum UserStatusReason {
  EMAIL_NOT_VERIFIED = "email_not_verified",
  PHONE_NOT_VERIFIED = "phone_not_verified", 
  PROFILE_INCOMPLETE = "profile_incomplete",
  GENERAL_BLOCK = "general_block"
}

export interface UserStatus {
  is_approved: boolean;
  reason?: UserStatusReason;
  reason_description?: string;
}

export const USER_STATUS_MESSAGES = {
  [UserStatusReason.EMAIL_NOT_VERIFIED]: "אנא אמת את כתובת האימייל שלך כדי לבצע פעולה זו",
  [UserStatusReason.PHONE_NOT_VERIFIED]: "אנא אמת את מספר הטלפון שלך כדי לבצע פעולה זו", 
  [UserStatusReason.PROFILE_INCOMPLETE]: "אנא השלם את פרטי הפרופיל שלך (כולל תמונת פרופיל) כדי לבצע פעולה זו",
  [UserStatusReason.GENERAL_BLOCK]: "לא ניתן לבצע פעולה זו כרגע. ניתן ליצור קשר מדף הפרופיל"
};