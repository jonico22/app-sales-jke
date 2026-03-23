import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/react-query';
import type { Society } from '@/services/society.service';

interface SocietyState {
    society: Society | null;
    setSociety: (society: Society) => void;
    clearSociety: () => void;
}

export const useSocietyStore = create<SocietyState>()(
    persist(
        (set) => ({
            society: null,
            setSociety: (society) => {
                queryClient.clear();
                set({ society });
            },
            clearSociety: () => {
                queryClient.clear();
                set({ society: null });
            },
        }),
        {
            name: 'society-storage',
        }
    )
);
