import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useAuthQuery } from './useAuthQuery';
import { useNavigate } from 'react-router-dom';

import { AxiosError } from 'axios';

export function useSessionValidator() {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { logout, setSubscription, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleRedirect = useCallback(() => {
    localStorage.setItem('redirectUrl', window.location.pathname + window.location.search);
    logout();
    navigate('/auth/login');
    setIsSessionExpired(false);
  }, [logout, navigate]);

  const { data, error, isError } = useAuthQuery();

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

  useEffect(() => {
    if (isError) {
      const err = error as AxiosError;
      if (err.response?.status === 401 || err.status === 401) {
        setIsSessionExpired(true);
      }
    }
  }, [isError, error]);


  return {
    isSessionExpired,
    handleRedirect
  };
}
