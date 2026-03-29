import { alerts } from './alerts';
import Swal from 'sweetalert2';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock sweetalert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock sweetalert2-react-content
vi.mock('sweetalert2-react-content', () => ({
  default: vi.fn((swal) => swal),
}));

describe('alerts utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show an alert with correct parameters', async () => {
        (Swal.fire as any).mockResolvedValue({ isConfirmed: true });

        await alerts.show({
            title: 'Test Title',
            text: 'Test Text',
            icon: 'success'
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test Title',
            text: 'Test Text',
            icon: 'success',
            confirmButtonColor: '#00BFFF' // From implementation COLORS.primary
        }));
    });

    it('should show confirm dialog and return true if confirmed', async () => {
        (Swal.fire as any).mockResolvedValue({ isConfirmed: true });

        const result = await alerts.confirm({
            title: 'Delete?',
            text: 'Are you sure?'
        });

        expect(result).toBe(true);
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar'
        }));
    });

    it('should show confirm dialog and return false if cancelled', async () => {
        (Swal.fire as any).mockResolvedValue({ isConfirmed: false });

        const result = await alerts.confirm({
            title: 'Delete?',
            text: 'Are you sure?'
        });

        expect(result).toBe(false);
    });
});
