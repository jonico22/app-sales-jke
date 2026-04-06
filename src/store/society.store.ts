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
            // Only update the store data — do NOT wipe the entire query cache.
            // Clearing the cache here causes the permissions query to reset,
            // which makes the sidebar flash skeleton loaders on every page that
            // calls societyService.getCurrent().
            setSociety: (society) => {
                set({ society });
            },
            // On logout we DO want to nuke the whole cache.
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
