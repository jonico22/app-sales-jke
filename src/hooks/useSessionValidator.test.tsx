import { renderHook, act } from '@testing-library/react';
import { useSessionValidator } from './useSessionValidator';
import { useAuthStore } from '@/store/auth.store';
import { useAuthQuery } from './useAuthQuery';
import { useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('./useAuthQuery', () => ({
  useAuthQuery: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('useSessionValidator hook', () => {
    const mockLogout = vi.fn();
    const mockSetSubscription = vi.fn();
    const mockUpdateUser = vi.fn();
    const mockNavigate = vi.fn();
    const mockAuthState = {
        logout: mockLogout,
        setSubscription: mockSetSubscription,
        updateUser: mockUpdateUser,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        window.history.replaceState(null, '', '/dashboard?tab=main');
        (useAuthStore as any).mockImplementation((selector: any) => selector(mockAuthState));
        (useNavigate as any).mockReturnValue(mockNavigate);
        
        // Default mock for useAuthQuery
        (useAuthQuery as any).mockReturnValue({
            data: null,
            isError: false,
            error: null,
        });
    });

    it('should sync subscription and user when data is present', () => {
        const mockData = {
            data: {
                subscription: { id: 'sub-1' },
                user: { id: 'user-1', name: 'Test' }
            }
        };
        (useAuthQuery as any).mockReturnValue({
            data: mockData,
            isError: false,
            error: null,
        });

        renderHook(() => useSessionValidator());

        expect(mockSetSubscription).toHaveBeenCalledWith(mockData.data.subscription);
        expect(mockUpdateUser).toHaveBeenCalledWith(mockData.data.user);
    });

    it('should set isSessionExpired to true on 401 error', () => {
        const mockError = { response: { status: 401 } };
        (useAuthQuery as any).mockReturnValue({
            data: null,
            isError: true,
            error: mockError,
        });

        const { result } = renderHook(() => useSessionValidator());

        expect(result.current.isSessionExpired).toBe(true);
    });

    it('should handle redirect correctly', () => {
      const { result } = renderHook(() => useSessionValidator());

      act(() => {
        result.current.handleRedirect();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
      expect(sessionStorage.getItem('redirectUrl')).toBe('/dashboard?tab=main');
      expect(result.current.isSessionExpired).toBe(false);
    });
});
