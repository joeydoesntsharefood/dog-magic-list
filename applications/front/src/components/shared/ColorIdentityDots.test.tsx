import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ColorIdentityDots from './ColorIdentityDots';

describe('ColorIdentityDots Component', () => {
  it('renders colorless dot when colors array is empty', () => {
    render(<ColorIdentityDots colors={[]} />);
    const dot = screen.getByTitle('Colorless');
    expect(dot.className).toContain('mtg-colorless');
  });

  it('renders colored dots for white and blue mana', () => {
    render(<ColorIdentityDots colors={['W', 'U']} />);
    
    const whiteDot = screen.getByTitle('W');
    const blueDot = screen.getByTitle('U');
    
    expect(whiteDot.className).toContain('mtg-white');
    expect(blueDot.className).toContain('mtg-blue');
  });
});
