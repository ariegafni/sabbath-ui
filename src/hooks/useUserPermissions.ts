"use client";

import { useState } from "react";
import { useAuth } from "@/Providers/AuthProvider";
import { createUserPermissions, PermissionCheck } from "@/shared/lib/userPermissions";

export const useUserPermissions = () => {
  const { user } = useAuth();
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockModalData, setBlockModalData] = useState<{
    title: string;
    message: string;
    requiredActions: string[];
  }>({
    title: "",
    message: "",
    requiredActions: []
  });

  const permissions = createUserPermissions(user);

  /**
   * בדיקת הרשאה עם הצגת חלון חסימה אוטומטית
   */
  const checkPermissionWithModal = (
    permissionCheck: () => PermissionCheck,
    actionTitle: string
  ): boolean => {
    const result = permissionCheck();
    
    if (!result.allowed) {
      setBlockModalData({
        title: actionTitle,
        message: result.message || "לא ניתן לבצע פעולה זו כרגע",
        requiredActions: permissions.getRequiredActions()
      });
      setIsBlockModalOpen(true);
      return false;
    }
    
    return true;
  };

  /**
   * בדיקת הרשאה ליצירת אירוח
   */
  const checkCanCreateHosting = () => {
    return checkPermissionWithModal(
      () => permissions.canCreateHosting(),
      "יצירת אירוח חדש"
    );
  };

  /**
   * בדיקת הרשאה לבקשת אירוח
   */
  const checkCanCreateHostingRequest = () => {
    return checkPermissionWithModal(
      () => permissions.canCreateHostingRequest(),
      "בקשת אירוח לשבת"
    );
  };

  /**
   * בדיקת הרשאה לשליחת הודעות
   */
  const checkCanSendMessages = () => {
    return checkPermissionWithModal(
      () => permissions.canSendMessages(),
      "שליחת הודעות"
    );
  };

  /**
   * סגירת חלון החסימה
   */
  const closeBlockModal = () => {
    setIsBlockModalOpen(false);
  };

  return {
    // בדיקות הרשאות עם מודלים
    checkCanCreateHosting,
    checkCanCreateHostingRequest,
    checkCanSendMessages,
    
    // בדיקות הרשאות ללא מודלים
    canCreateHosting: permissions.canCreateHosting(),
    canCreateHostingRequest: permissions.canCreateHostingRequest(),
    canSendMessages: permissions.canSendMessages(),
    canUpdateProfile: permissions.canUpdateProfile(),
    
    // מידע למודל החסימה
    isBlockModalOpen,
    blockModalData,
    closeBlockModal,
    
    // מידע כללי על המשתמש
    needsProfileCompletion: permissions.needsProfileCompletion(),
    requiredActions: permissions.getRequiredActions(),
    blockMessage: permissions.getBlockMessage(),
    
    // אובייקט ההרשאות המלא
    permissions
  };
};