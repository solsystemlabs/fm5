import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

// Simple example test to validate testing setup
describe('Testing Framework Setup', () => {
  it('should render a basic component', () => {
    const TestComponent = () => <div>Hello, Test!</div>

    render(<TestComponent />)

    expect(screen.getByText('Hello, Test!')).toBeInTheDocument()
  })

  it('should handle environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.APP_URL).toBe('http://localhost:3000')
  })
})
