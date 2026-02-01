import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginData, User, Role } from '@/services/auth.service';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (data: LoginData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      login: (data: LoginData) => {
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          role: data.role,
        });
        // We can also handle localStorage manually here if needed, 
        // but 'persist' middleware handles it for the store state.
        // The previous auth.service login method also sets 'token' in localStorage manually.
        // We should probably rely on the store's persistence or keep them in sync.
        // For now, let's allow the store to manage its own persistence 'auth-storage'.
      },
      logout: () => {
        set({ token: null, user: null, role: null, isAuthenticated: false });
        localStorage.removeItem('token'); // Clear the manual token if we still use it for interceptors
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role, isAuthenticated: state.isAuthenticated }),
    }
  )
);
