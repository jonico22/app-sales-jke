import { create } from 'zustand';
import type { LoginData, MeResponse, User, Role, SubscriptionInfo } from '@/services/auth.service';
import { queryClient } from '@/lib/react-query';
import { useSocietyStore } from './society.store';
import { useBranchStore } from './branch.store';
import { useCartStore } from './cart.store';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
  role: Role | null;
  subscription: SubscriptionInfo | null;
  modulePermissions: Record<string, boolean> | null;
  login: (data: LoginData) => void;
  hydrateSession: (data: MeResponse['data']) => void;
  logout: () => void;
  markAuthResolved: () => void;
  setMustChangePassword: (must: boolean) => void;
  updateUser: (user: User) => void;
  setSubscription: (subscription: SubscriptionInfo | null) => void;
  setModulePermissions: (permissions: Record<string, boolean> | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  role: null,
  subscription: null,
  modulePermissions: null,
  isAuthenticated: false,
  isAuthResolved: false,
  login: (data: LoginData) => {
    set({
      token: data.token,
      user: data.user,
      isAuthenticated: true,
      isAuthResolved: true,
      role: data.role,
      subscription: data.subscription || null,
      modulePermissions: null,
    });
  },
  hydrateSession: (data) => {
    set((state) => ({
      token: data.token,
      user: data.user,
      role: data.role,
      subscription: data.subscription || null,
      modulePermissions: state.modulePermissions,
      isAuthenticated: true,
      isAuthResolved: true,
    }));
  },
  logout: () => {
    useSocietyStore.getState().clearSociety();
    useBranchStore.getState().clearBranch();
    useCartStore.getState().clearCart();
    useCartStore.getState().clearCurrentOrder();

    queryClient.clear();
    set({
      token: null,
      user: null,
      role: null,
      subscription: null,
      modulePermissions: null,
      isAuthenticated: false,
      isAuthResolved: true,
    });

    localStorage.removeItem('pos-cart-storage');
    localStorage.removeItem('branch-storage');
    localStorage.removeItem('society-storage');
  },
  markAuthResolved: () => {
    set((state) => (state.isAuthResolved ? state : { ...state, isAuthResolved: true }));
  },
  setMustChangePassword: (must: boolean) => {
    set((state) => ({
      user: state.user ? { ...state.user, mustChangePassword: must } : null
    }));
  },
  updateUser: (user: User) => {
    set((state) => ({ ...state, user }));
  },
  setSubscription: (subscription: SubscriptionInfo | null) => {
    set((state) => ({ ...state, subscription }));
  },
  setModulePermissions: (modulePermissions: Record<string, boolean> | null) => {
    set((state) => ({ ...state, modulePermissions }));
  },
}));
