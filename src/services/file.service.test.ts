import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileService, FileCategory } from './file.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('fileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses gallery and reports endpoints with params', async () => {
    await fileService.getReports({ page: 2 });
    await fileService.getGallery({ search: 'invoice' });

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/files/reports', { params: { page: 2 } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/files', { params: { search: 'invoice', excludeCategory: FileCategory.REPORT } });
  });

  it('handles upload, metadata and delete operations', async () => {
    const file = new File(['hello'], 'report.pdf', { type: 'application/pdf' });

    await fileService.upload(file, FileCategory.REPORT);
    await fileService.registerExternal({
      name: 'Manual',
      path: 'https://example.com/manual.pdf',
      mimeType: 'application/pdf',
      storageType: 'EXTERNAL',
      category: FileCategory.GENERAL,
    });
    await fileService.getById('f1');
    await fileService.update('f1', { name: 'Manual 2' });
    await fileService.delete('f1');

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/sales/files/upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    expect(api.post).toHaveBeenNthCalledWith(2, '/sales/files', expect.objectContaining({ name: 'Manual' }));
    expect(api.get).toHaveBeenCalledWith('/sales/files/f1');
    expect(api.put).toHaveBeenCalledWith('/sales/files/f1', { name: 'Manual 2' });
    expect(api.delete).toHaveBeenCalledWith('/sales/files/f1');
  });
});
