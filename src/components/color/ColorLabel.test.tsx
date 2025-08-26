import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorLabel } from './ColorLabel';

// Mock the router hook
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('ColorLabel', () => {
  it('should render color label with name', () => {
    render(<ColorLabel color="#ff0000" name="Red PLA" />);
    
    expect(screen.getByText('Red PLA')).toBeInTheDocument();
    
    const colorIndicator = screen.getByLabelText('Red PLA color indicator');
    expect(colorIndicator).toBeInTheDocument();
    expect(colorIndicator).toHaveStyle('background-color: #ff0000');
  });

  it('should render with brand when provided', () => {
    render(<ColorLabel color="#00ff00" name="Green ABS" brand="Hatchbox" />);
    
    expect(screen.getByText('Green ABS')).toBeInTheDocument();
    expect(screen.getByText('Hatchbox')).toBeInTheDocument();
  });

  it('should handle invalid color gracefully', () => {
    render(<ColorLabel color="invalid-color" name="Test Filament" />);
    
    expect(screen.getByText('Test Filament')).toBeInTheDocument();
    
    const colorIndicator = screen.getByLabelText('Test Filament color indicator');
    expect(colorIndicator).toBeInTheDocument();
  });
});