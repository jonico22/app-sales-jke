import { useSocietyStore } from './society.store';
import { queryClient } from '@/lib/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('societyStore', () => {
    const mockSociety = { id: 1, name: 'Main Society' } as any;

    beforeEach(() => {
        useSocietyStore.setState({
            society: null,
        });
        vi.spyOn(queryClient, 'clear').mockImplementation(() => {});
        vi.clearAllMocks();
    });

    it('should have initial state', () => {
        const state = useSocietyStore.getState();
        expect(state.society).toBeNull();
    });

    it('should set society', () => {
        useSocietyStore.getState().setSociety(mockSociety);

        const state = useSocietyStore.getState();
        expect(state.society).toEqual(mockSociety);
        expect(queryClient.clear).not.toHaveBeenCalled(); // Shoud NOT clear on set
    });

    it('should clear society and queryClient', () => {
        useSocietyStore.setState({ society: mockSociety });

        useSocietyStore.getState().clearSociety();

        const state = useSocietyStore.getState();
        expect(state.society).toBeNull();
        expect(queryClient.clear).toHaveBeenCalled(); // SHOUD clear on clearSociety
    });
});
