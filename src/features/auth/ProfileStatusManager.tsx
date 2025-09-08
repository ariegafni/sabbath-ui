"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/Providers/AuthProvider';
import { shouldShowIncompleteProfilePrompt } from '@/shared/lib/useProfileStatus';
import IncompleteProfilePrompt from './IncompleteProfilePrompt';

export default function ProfileStatusManager() {
  const { user } = useAuth();
  const [showIncompletePrompt, setShowIncompletePrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Only show the prompt once per session and only if the conditions are met
    if (user && shouldShowIncompleteProfilePrompt(user) && !hasShownPrompt) {
      // Add a small delay to ensure the app has loaded
      const timer = setTimeout(() => {
        setShowIncompletePrompt(true);
        setHasShownPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, hasShownPrompt]);

  if (!user || !showIncompletePrompt) {
    return null;
  }

  return (
    <IncompleteProfilePrompt
      isOpen={showIncompletePrompt}
      onClose={() => setShowIncompletePrompt(false)}
      onComplete={() => {
        setShowIncompletePrompt(false);
        // Refresh user data after profile completion
        window.location.reload();
      }}
      userInfo={{
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      }}
    />
  );
}