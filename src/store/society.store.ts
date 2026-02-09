import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
            setSociety: (society) => set({ society }),
            clearSociety: () => set({ society: null }),
        }),
        {
            name: 'society-storage',
        }
    )
);
