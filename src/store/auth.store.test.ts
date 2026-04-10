import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { useSocietyStore } from './society.store';
import { useBranchStore } from './branch.store';
import { useCartStore } from './cart.store';
import { queryClient } from '@/lib/react-query';

describe('authStore', () => {
    beforeEach(() => {
        // Reset store manually
        useAuthStore.setState({
            token: null,
            user: null,
            role: null,
            subscription: null,
            modulePermissions: null,
            isAuthenticated: false,
            isAuthResolved: false,
        });

        // Initialize spies on real store actions
        vi.spyOn(useSocietyStore.getState(), 'clearSociety').mockImplementation(() => {});
        vi.spyOn(useBranchStore.getState(), 'clearBranch').mockImplementation(() => {});
        vi.spyOn(useCartStore.getState(), 'clearCart').mockImplementation(() => {});
        vi.spyOn(useCartStore.getState(), 'clearCurrentOrder').mockImplementation(() => {});
        vi.spyOn(queryClient, 'clear').mockImplementation(() => {});

        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAuthResolved).toBe(false);
    });

    it('should update state on login', () => {
        const mockLoginData: any = {
            token: 'mock-token',
            user: { id: '1', name: 'Test User' },
            role: { id: '1', name: 'Admin' },
            subscription: { planId: 'plan-1', status: 'ACTIVE', endDate: '2026-12-31' },
            newExpiresAt: '2026-12-31',
            session: { id: 's1', token: 'mock-token', expiresAt: '2026-12-31', userId: '1' }
        };

        useAuthStore.getState().login(mockLoginData);

        const state = useAuthStore.getState();
        expect(state.token).toBe('mock-token');
        expect(state.user?.name).toBe('Test User');
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAuthResolved).toBe(true);
        expect(state.subscription?.planId).toBe('plan-1');
    });

    it('should hydrate session from backend data', () => {
        useAuthStore.getState().hydrateSession({
            token: 'hydrated-token',
            expiresAt: '2026-12-31',
            user: { id: '1', name: 'Hydrated User' } as any,
            role: { id: '1', name: 'Admin' } as any,
            subscription: { planId: 'plan-1', status: 'ACTIVE', endDate: '2026-12-31' },
        });

        const state = useAuthStore.getState();
        expect(state.token).toBe('hydrated-token');
        expect(state.user?.name).toBe('Hydrated User');
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAuthResolved).toBe(true);
    });

    it('should clear all data on logout', () => {
        useAuthStore.setState({ token: 'active-token', isAuthenticated: true });

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAuthResolved).toBe(true);
        
        // Verify other stores and cache are cleared via spies
        expect(useSocietyStore.getState().clearSociety).toHaveBeenCalled();
        expect(useBranchStore.getState().clearBranch).toHaveBeenCalled();
        expect(useCartStore.getState().clearCart).toHaveBeenCalled();
        expect(queryClient.clear).toHaveBeenCalled();
    });

    it('should update user data without affecting other fields', () => {
        useAuthStore.setState({ 
            user: { id: '1', name: 'Old Name' } as any,
            token: 'token' 
        });

        useAuthStore.getState().updateUser({ id: '1', name: 'New Name' } as any);

        const state = useAuthStore.getState();
        expect(state.user?.name).toBe('New Name');
        expect(state.token).toBe('token');
    });

    it('should set module permissions', () => {
        const permissions = { 'SALES_VIEW': true, 'STOCK_EDIT': false };
        useAuthStore.getState().setModulePermissions(permissions);

        const state = useAuthStore.getState();
        expect(state.modulePermissions).toEqual(permissions);
    });
});
