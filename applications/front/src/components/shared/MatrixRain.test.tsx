import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MatrixRain from './MatrixRain';

describe('MatrixRain Component', () => {
  it('renders a canvas element', () => {
    render(<MatrixRain />);
    const canvas = screen.getByTestId('matrix-rain');
    expect(canvas.tagName).toBe('CANVAS');
  });
});
