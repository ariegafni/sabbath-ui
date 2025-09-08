import { useEffect, useState } from 'react';
import { AuthUser } from '@/service/auth';
import { UserStatusReason } from '@/shared/types/userStatus';

interface ProfileStatus {
  isComplete: boolean;
  needsEmailVerification: boolean;
  needsProfileCompletion: boolean;
  missingFields: string[];
}

export function useProfileStatus(user: AuthUser | null): ProfileStatus {
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>({
    isComplete: true,
    needsEmailVerification: false,
    needsProfileCompletion: false,
    missingFields: [],
  });

  useEffect(() => {
    if (!user) {
      setProfileStatus({
        isComplete: true,
        needsEmailVerification: false,
        needsProfileCompletion: false,
        missingFields: [],
      });
      return;
    }

    const missingFields: string[] = [];
    let needsEmailVerification = false;
    let needsProfileCompletion = false;

    // Check email verification
    if (!user.is_verified) {
      needsEmailVerification = true;
    }

    // Check profile completeness
    if (user.status_reason === UserStatusReason.PROFILE_INCOMPLETE) {
      needsProfileCompletion = true;
      
      if (!user.profile_image) {
        missingFields.push('profile_image');
      }
      
      if (!user.phone) {
        missingFields.push('phone');
      }
    }

    const isComplete = user.is_verified && user.is_approved && missingFields.length === 0;

    setProfileStatus({
      isComplete,
      needsEmailVerification,
      needsProfileCompletion,
      missingFields,
    });
  }, [user]);

  return profileStatus;
}

export function shouldShowIncompleteProfilePrompt(user: AuthUser | null): boolean {
  if (!user) return false;
  
  return (
    user.is_verified && // Email is verified
    !user.is_approved && // But user is not approved
    user.status_reason === UserStatusReason.PROFILE_INCOMPLETE // Due to incomplete profile
  );
}