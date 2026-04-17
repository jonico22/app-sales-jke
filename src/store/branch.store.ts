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

function normalizeBranchText(value?: string | null) {
    return (value || '').trim().toLowerCase();
}

function resolvePreferredBranch(
    branches: BranchOfficeSelectOption[],
    selectedBranch: BranchOfficeSelectOption | null,
) {
    if (branches.length === 0) return null;

    const matchedSelectedBranch = selectedBranch
        ? branches.find((branch) => branch.id === selectedBranch.id) || null
        : null;

    if (matchedSelectedBranch) return matchedSelectedBranch;

    const principalBranch = branches.find((branch) => {
        const normalizedName = normalizeBranchText(branch.name);
        const normalizedCode = normalizeBranchText(branch.code);

        return normalizedCode === 'main' || normalizedName.includes('principal');
    });

    return principalBranch || branches[0];
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set) => ({
            branches: [],
            selectedBranch: null,
            setBranches: (branches) =>
                set((state) => ({
                    branches,
                    selectedBranch: resolvePreferredBranch(branches, state.selectedBranch),
                })),
            selectBranch: (branch) => set({ selectedBranch: branch }),
            clearBranch: () => set({ selectedBranch: null, branches: [] }),
        }),
        {
            name: 'branch-storage',
        }
    )
);
