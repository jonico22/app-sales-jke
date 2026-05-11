import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAuthQuery } from './useAuthQuery';
import { useNavigate } from 'react-router-dom';
import { sessionRedirect } from '@/utils/session-redirect';
import { AxiosError } from 'axios';

export function useSessionValidator() {
  const logout = useAuthStore(state => state.logout);
  const setSubscription = useAuthStore(state => state.setSubscription);
  const updateUser = useAuthStore(state => state.updateUser);
  const navigate = useNavigate();
  const { data, error, isError } = useAuthQuery();

  const err = error as AxiosError | null;
  const isSessionExpired = isError && (err?.response?.status === 401 || err?.status === 401);

  const handleRedirect = useCallback(() => {
    sessionRedirect.saveCurrentPath();
    logout();
    navigate('/auth/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (data?.data) {
      if (data.data.subscription) {
        setSubscription(data.data.subscription);
      }
      if (data.data.user) {
        updateUser(data.data.user);
      }
    }
  }, [data, setSubscription, updateUser]);

  return {
    isSessionExpired,
    handleRedirect
  };
}
