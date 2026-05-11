import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './product.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses search and helper endpoints', async () => {
    await productService.getAll({ search: 'camisa', lowStock: true });
    await productService.getForSelect({ branchId: 'b1' });
    await productService.getById('p1');
    await productService.getBestSellers();
    await productService.getBrands();
    await productService.getColors();

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/products', { params: { search: 'camisa', lowStock: true } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/products/select', { params: { branchId: 'b1' } });
    expect(api.get).toHaveBeenNthCalledWith(3, '/sales/products/p1');
    expect(api.get).toHaveBeenNthCalledWith(4, '/sales/products/best-sellers');
    expect(api.get).toHaveBeenNthCalledWith(5, '/sales/products/brands');
    expect(api.get).toHaveBeenNthCalledWith(6, '/sales/products/colors');
  });

  it('handles CRUD and bulk upload requests', async () => {
    const file = new File(['id,name'], 'products.csv', { type: 'text/csv' });

    await productService.create({
      code: 'P001',
      name: 'Camisa',
      categoryId: 'cat1',
      price: 10,
      priceCost: 5,
    });
    await productService.update('p1', { name: 'Camisa Azul' });
    await productService.delete('p1');
    await productService.getCreatedByUsers();
    await productService.bulkUpload(file);

    expect(api.post).toHaveBeenNthCalledWith(1, '/sales/products', expect.objectContaining({ code: 'P001' }));
    expect(api.put).toHaveBeenCalledWith('/sales/products/p1', { name: 'Camisa Azul' });
    expect(api.delete).toHaveBeenCalledWith('/sales/products/p1');
    expect(api.get).toHaveBeenCalledWith('/sales/products/created-by-users');
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/sales/products/bulk-upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });
});
