import { exportToExcel } from './excel.utils';
import { utils, writeFile } from 'xlsx';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock xlsx
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('excelUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should extract data row correctly based on columns with keys', () => {
        const data = [{ id: 1, name: 'Item 1' }];
        const columns = [
            { header: 'ID', key: 'id' },
            { header: 'Name', key: 'name' }
        ];

        exportToExcel(data, columns as any, 'test');

        expect(utils.json_to_sheet).toHaveBeenCalledWith([
            { 'ID': 1, 'Name': 'Item 1' }
        ]);
        expect(writeFile).toHaveBeenCalledWith(expect.anything(), 'test.xlsx');
    });

    it('should extract data row correctly based on columns with mapping functions', () => {
        const data = [{ id: 1, price: 100 }];
        const columns = [
            { header: 'Price with Tax', key: (item: any) => item.price * 1.5 }
        ];

        exportToExcel(data, columns as any, 'price-report');

        expect(utils.json_to_sheet).toHaveBeenCalledWith([
            { 'Price with Tax': 150 }
        ]);
    });

    it('should set columns widths if provided', () => {
        const data = [{ id: 1 }];
        const columns = [
            { header: 'ID', key: 'id', width: 25 }
        ];

        const mockSheet = {};
        (utils.json_to_sheet as any).mockReturnValue(mockSheet);

        exportToExcel(data, columns as any, 'test');

        expect(mockSheet).toHaveProperty('!cols');
        expect((mockSheet as any)['!cols']).toEqual([{ wch: 25 }]);
    });

    it('should return early if no data is provided', () => {
        exportToExcel([], []);
        expect(utils.json_to_sheet).not.toHaveBeenCalled();
    });
});
