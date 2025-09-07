import { useState } from "react";
import { useAuth } from "../../Providers/AuthProvider";
import { UserStatusReason } from "../types/userStatus";

interface PermissionCheckResult {
  allowed: boolean;
  reason?: UserStatusReason;
}

export function useUserPermissions() {
  const { user } = useAuth();
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [modalReason, setModalReason] = useState<UserStatusReason | undefined>(
    undefined
  );

  const checkPermission = (): PermissionCheckResult => {
    if (!user) {
      return { allowed: false };
    }

    if (!user.is_approved) {
      return {
        allowed: false,
        reason: user.status_reason,
      };
    }

    return { allowed: true };
  };

  const requirePermission = (onSuccess: () => void) => {
    const result = checkPermission();

    if (result.allowed) {
      onSuccess();
    } else {
      setModalReason(result.reason);
      setShowUnauthorizedModal(true);
    }
  };

  const closeModal = () => {
    setShowUnauthorizedModal(false);
    setModalReason(undefined);
  };

  return {
    checkPermission,
    requirePermission,
    showUnauthorizedModal,
    modalReason,
    closeModal,
    isApproved: user?.is_approved ?? true,
  };
}