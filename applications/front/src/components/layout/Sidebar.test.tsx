import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  it('renders all navigation items', () => {
    render(<Sidebar activeTab="lists" setActiveTab={() => {}} onResetWizard={() => {}} />);
    
    expect(screen.getByText(/\[01\] INVENTORY/i)).toBeDefined();
    expect(screen.getByText(/\[02\] MARKET/i)).toBeDefined();
    expect(screen.getByText(/\[03\] WIZARD/i)).toBeDefined();
  });

  it('highlights the active tab', () => {
    const { rerender } = render(<Sidebar activeTab="lists" setActiveTab={() => {}} onResetWizard={() => {}} />);
    expect(screen.getByText(/\[01\] INVENTORY/i).className).toContain('bg-zinc-800');

    rerender(<Sidebar activeTab="wizard" setActiveTab={() => {}} onResetWizard={() => {}} />);
    expect(screen.getByText(/\[03\] WIZARD/i).className).toContain('bg-[#8A3A34]');
  });

  it('calls setActiveTab and onResetWizard when wizard is clicked', () => {
    const setActiveTab = vi.fn();
    const onResetWizard = vi.fn();
    
    render(<Sidebar activeTab="lists" setActiveTab={setActiveTab} onResetWizard={onResetWizard} />);
    
    fireEvent.click(screen.getByText(/\[03\] WIZARD/i));
    
    expect(setActiveTab).toHaveBeenCalledWith('wizard');
    expect(onResetWizard).toHaveBeenCalled();
  });
});
