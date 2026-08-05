'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useAuthGuard() {
  const { isSignedIn } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [protectedActionName, setProtectedActionName] = useState('perform this action');

  const requireAuth = (callback: () => void, actionName: string = 'perform this action') => {
    if (isSignedIn) {
      callback();
    } else {
      setProtectedActionName(actionName);
      setAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return {
    isSignedIn,
    requireAuth,
    authModalOpen,
    closeAuthModal,
    protectedActionName,
  };
}
