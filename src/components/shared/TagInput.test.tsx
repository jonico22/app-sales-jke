import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from './TagInput';

const mockOptions = [
  { id: '1', name: 'React' },
  { id: '2', name: 'Vue' },
  { id: '3', name: 'Angular' },
];

describe('TagInput Component', () => {
  it('renders correctly with given options', () => {
    render(<TagInput options={mockOptions} value={[]} onChange={() => {}} placeholder="Select Tags" />);
    expect(screen.getByPlaceholderText(/select tags/i)).toBeDefined();
  });

  it('shows selected tags', () => {
    render(<TagInput options={mockOptions} value={['1', '2']} onChange={() => {}} />);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Vue')).toBeDefined();
    expect(screen.queryByText('Angular')).toBeNull();
  });

  it('calls onChange when a tag is removed', () => {
    const handleChange = vi.fn();
    render(<TagInput options={mockOptions} value={['1']} onChange={handleChange} />);
    
    const removeBtn = screen.getByRole('button');
    fireEvent.click(removeBtn);
    
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('filters options based on search term', () => {
    render(<TagInput options={mockOptions} value={[]} onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/seleccionar/i);
    
    fireEvent.change(input, { target: { value: 'Re' } });
    
    // Check if dropdown option is visible (we might need to mock Portal or wait for it)
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.queryByText('Vue')).toBeNull();
  });
});
