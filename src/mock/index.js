import userData from "./userData.json";
export { default as UserServiceMock } from "./userServiceMock";

// פונקציה שמחזירה את כל המידע על המשתמש
export const getUserData = () => {
  return userData.user;
};

// פונקציה שמחזירה מידע בסיסי על המשתמש
export const getBasicUserInfo = () => {
  const { firstName, lastName, email, profileImage, location } = userData.user;
  return { firstName, lastName, email, profileImage, location };
};

// פונקציה שמחזירה את פרופיל המארח
export const getHostProfile = () => {
  return userData.user.hostProfile;
};

// פונקציה שמחזירה את פרופיל האורח
export const getGuestProfile = () => {
  return userData.user.guestProfile;
};

// פונקציה שמחזירה את הפעילות האחרונה
export const getRecentActivity = () => {
  return userData.user.recentActivity;
};

// פונקציה שמחזירה את ההישגים
export const getAchievements = () => {
  return userData.user.achievements;
};

// פונקציה שמחזירה את הסטטיסטיקות
export const getStats = () => {
  return userData.user.stats;
};

// פונקציה שמחזירה את העדפות המשתמש
export const getUserPreferences = () => {
  return userData.user.preferences;
};

// פונקציה שמחזירה את שיטות התשלום
export const getPaymentMethods = () => {
  return userData.user.paymentMethods;
};

// פונקציה שמחזירה מידע על אימות המשתמש
export const getVerificationStatus = () => {
  return userData.user.verification;
};

// ייצוא ישיר של הנתונים
export default userData;
