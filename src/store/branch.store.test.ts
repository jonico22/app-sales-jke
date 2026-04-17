import { useBranchStore } from './branch.store';
import { describe, it, expect, beforeEach } from 'vitest';

describe('branchStore', () => {
    const mockBranch = { id: 1, name: 'Main Branch' } as any;
    const principalBranch = { id: '1', name: 'Sucursal Principal', code: 'MAIN', isActive: true } as any;
    const secondaryBranch = { id: '2', name: 'Sucursal Centro', code: 'CTR', isActive: true } as any;

    beforeEach(() => {
        useBranchStore.setState({
            branches: [],
            selectedBranch: null,
        });
    });

    it('should have initial state', () => {
        const state = useBranchStore.getState();
        expect(state.selectedBranch).toBeNull();
        expect(state.branches).toEqual([]);
    });

    it('should set branches', () => {
        const branches = [mockBranch];
        useBranchStore.getState().setBranches(branches);

        const state = useBranchStore.getState();
        expect(state.branches).toEqual(branches);
    });

    it('should select principal branch by default when setting branches', () => {
        useBranchStore.getState().setBranches([secondaryBranch, principalBranch]);

        const state = useBranchStore.getState();
        expect(state.selectedBranch).toEqual(principalBranch);
    });

    it('should keep the selected branch if it still exists after refreshing branches', () => {
        useBranchStore.setState({
            branches: [principalBranch, secondaryBranch],
            selectedBranch: secondaryBranch,
        });

        useBranchStore.getState().setBranches([principalBranch, secondaryBranch]);

        const state = useBranchStore.getState();
        expect(state.selectedBranch).toEqual(secondaryBranch);
    });

    it('should select a branch', () => {
        useBranchStore.getState().selectBranch(mockBranch);

        const state = useBranchStore.getState();
        expect(state.selectedBranch).toEqual(mockBranch);
    });

    it('should clear branch data', () => {
        useBranchStore.setState({
            branches: [mockBranch],
            selectedBranch: mockBranch,
        });

        useBranchStore.getState().clearBranch();

        const state = useBranchStore.getState();
        expect(state.selectedBranch).toBeNull();
        expect(state.branches).toEqual([]);
    });
});
