import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BranchOfficeSelectOption } from '@/services/branch-office.service';

interface BranchState {
    branches: BranchOfficeSelectOption[];
    selectedBranch: BranchOfficeSelectOption | null;
    setBranches: (branches: BranchOfficeSelectOption[]) => void;
    selectBranch: (branch: BranchOfficeSelectOption) => void;
    clearBranch: () => void;
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set) => ({
            branches: [],
            selectedBranch: null,
            setBranches: (branches) => set({ branches }),
            selectBranch: (branch) => set({ selectedBranch: branch }),
            clearBranch: () => set({ selectedBranch: null, branches: [] }),
        }),
        {
            name: 'branch-storage',
        }
    )
);
