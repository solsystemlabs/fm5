import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, expect } from 'vitest';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test utilities for form testing
export const fillFormField = async (
  user: ReturnType<typeof import('@testing-library/user-event').default.setup>,
  fieldName: string,
  value: string
) => {
  const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
  if (field) {
    await user.clear(field);
    await user.type(field, value);
  }
};

// Mock fetch for components that don't use MSW
export const mockFetch = (response: any, ok = true, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

// Helper to create mock files for upload tests
export const createMockFile = (
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
): File => {
  const blob = new Blob([''], { type });
  Object.defineProperty(blob, 'size', { value: size });
  return new File([blob], name, { type });
};

// Utility to wait for async operations in tests
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock router navigation for isolated component tests
export const mockNavigate = vi.fn();

// Helper to assert form validation errors
export const expectFormError = (container: HTMLElement, fieldName: string, errorMessage: string) => {
  const field = container.querySelector(`[name="${fieldName}"]`);
  expect(field).toBeInTheDocument();
  const errorElement = container.querySelector(`[name="${fieldName}"] + p`);
  expect(errorElement).toHaveTextContent(errorMessage);
};

// Helper to check if form submit button is disabled
export const expectSubmitDisabled = (container: HTMLElement) => {
  const submitButton = container.querySelector('button[type="submit"]');
  expect(submitButton).toBeDisabled();
};

// Helper to check if form submit button is enabled
export const expectSubmitEnabled = (container: HTMLElement) => {
  const submitButton = container.querySelector('button[type="submit"]');
  expect(submitButton).not.toBeDisabled();
};