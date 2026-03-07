import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do HTMLCanvasElement getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock Global de Fetch para evitar falhas de sincronia
global.fetch = vi.fn((url: any) => {
  if (url.includes('/lists')) {
    return Promise.resolve({
      ok: true,
      json: async () => [],
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  } as Response);
});

// Mock Notification
global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
})) as any;
(global.Notification as any).permission = 'granted';
(global.Notification as any).requestPermission = vi.fn().mockResolvedValue('granted');
