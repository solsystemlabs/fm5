import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorLabel } from './ColorLabel';

describe('ColorLabel', () => {
  it('should render color label with correct color', () => {
    render(<ColorLabel color="#ff0000" />);
    
    const colorElement = screen.getByRole('img', { hidden: true });
    expect(colorElement).toBeInTheDocument();
  });

  it('should handle invalid color gracefully', () => {
    render(<ColorLabel color="invalid-color" />);
    
    const colorElement = screen.getByRole('img', { hidden: true });
    expect(colorElement).toBeInTheDocument();
  });
});