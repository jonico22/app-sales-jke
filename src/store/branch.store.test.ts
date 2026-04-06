import { useBranchStore } from './branch.store';
import { describe, it, expect, beforeEach } from 'vitest';

describe('branchStore', () => {
    const mockBranch = { id: 1, name: 'Main Branch' } as any;

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
