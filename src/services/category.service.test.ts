import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from './category.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list, select, CRUD and bulk upload endpoints', async () => {
    const file = new File(['code,name'], 'categories.csv', { type: 'text/csv' });

    await categoryService.getAll({ isActive: true });
    await categoryService.getForSelect();
    await categoryService.getById('cat1');
    await categoryService.create({ code: 'CAT', name: 'Ropa' });
    await categoryService.update('cat1', { name: 'Accesorios' });
    await categoryService.delete('cat1');
    await categoryService.getCreatedByUsers();
    await categoryService.bulkUpload(file);

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/categories', { params: { isActive: true } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/categories/select');
    expect(api.get).toHaveBeenNthCalledWith(3, '/sales/categories/cat1');
    expect(api.get).toHaveBeenNthCalledWith(4, '/sales/categories/created-by-users');
    expect(api.post).toHaveBeenNthCalledWith(1, '/sales/categories', { code: 'CAT', name: 'Ropa' });
    expect(api.put).toHaveBeenCalledWith('/sales/categories/cat1', { name: 'Accesorios' });
    expect(api.delete).toHaveBeenCalledWith('/sales/categories/cat1');
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/sales/categories/bulk-upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });
});
