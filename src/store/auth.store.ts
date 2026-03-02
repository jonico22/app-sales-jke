import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginData, User, Role, SubscriptionInfo } from '@/services/auth.service';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  subscription: SubscriptionInfo | null;
  login: (data: LoginData) => void;
  logout: () => void;
  setMustChangePassword: (must: boolean) => void;
  updateUser: (user: User) => void;
  setSubscription: (subscription: SubscriptionInfo | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      subscription: null,
      isAuthenticated: false,
      login: (data: LoginData) => {
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          role: data.role,
          subscription: data.subscription || null,
        });
        // We can also handle localStorage manually here if needed, 
        // but 'persist' middleware handles it for the store state.
        // The previous auth.service login method also sets 'token' in localStorage manually.
        // We should probably rely on the store's persistence or keep them in sync.
        // For now, let's allow the store to manage its own persistence 'auth-storage'.
      },
      logout: () => {
        set({ token: null, user: null, role: null, subscription: null, isAuthenticated: false });
        localStorage.removeItem('token'); // Clear the manual token if we still use it for interceptors

        // Clear all other stores
        // We need to import and clear cart, branch, and society stores
        // This will be done by clearing their localStorage keys
        localStorage.removeItem('pos-cart-storage');
        localStorage.removeItem('branch-storage');
        localStorage.removeItem('society-storage');
      },
      setMustChangePassword: (must: boolean) => {
        set((state) => ({
          user: state.user ? { ...state.user, mustChangePassword: must } : null
        }));
      },
      updateUser: (user: User) => {
        set({ user });
      },
      setSubscription: (subscription: SubscriptionInfo | null) => {
        set({ subscription });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role, subscription: state.subscription, isAuthenticated: state.isAuthenticated }),
    }
  )
);
