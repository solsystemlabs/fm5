/**
 * Component Smoke Tests
 * Basic rendering verification for core components
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../components/layout/Header'

// Mock Tanstack Router for testing
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('Header Component Smoke Tests', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<Header />)
    }).not.toThrow()
  })

  it('should contain navigation elements', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should contain Home link', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('should have proper CSS classes for styling', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass(
      'p-2',
      'flex',
      'gap-2',
      'bg-white',
      'text-black',
      'justify-between',
    )
  })
})

describe('Core Component Integration', () => {
  it('should handle rendering without external dependencies', () => {
    // Test that components can render in isolation
    expect(() => {
      render(<Header />)
    }).not.toThrow()
  })

  it('should not have console errors during render', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<Header />)

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
