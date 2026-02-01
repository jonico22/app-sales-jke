import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';

import { AxiosError } from 'axios';

export function useSessionValidator() {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { isAuthenticated, logout, token } = useAuthStore();
  const navigate = useNavigate();

  const handleRedirect = useCallback(() => {
    logout();
    navigate('/auth/login');
    setIsSessionExpired(false);
  }, [logout, navigate]);

  useEffect(() => {
    // Only check if we think we are authenticated
    if (!isAuthenticated || !token) return;

    const checkSession = async () => {
      try {
        await authService.getMe();
      } catch (error) {
        const err = error as AxiosError;
        // If 401 Unauthorized, session is definitely expired/invalid
        if (err.response?.status === 401 || err.status === 401) {
          setIsSessionExpired(true);
        }
        // We could also check for other specific error codes if needed
      }
    };

    // Check on mount
    checkSession();

    // Optional: Check on window focus to catch expiration that happened in other tabs/sleep
    const handleFocus = () => checkSession();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, token]);

  return {
    isSessionExpired,
    handleRedirect
  };
}
