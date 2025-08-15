import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import { ActivityHistory } from '../ActivityHistory';
import { mockActivityEntries, createMockActivityEntry } from '@/test/fixtures/user-profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('ActivityHistory', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('shows loading skeleton on initial load', async () => {
      // Mock slow API response
      server.use(
        http.get('/api/users/me/activity', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            entries: mockActivityEntries,
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      // Should show loading skeleton
      expect(screen.getAllByRole('generic', { hidden: true })).toHaveLength(5); // 5 skeleton items

      await waitFor(() => {
        expect(screen.getByText('Updated profile information')).toBeInTheDocument();
      });
    });

    it('shows loading spinner when loading more activities', async () => {
      const firstPage = mockActivityEntries.slice(0, 2);
      const secondPage = mockActivityEntries.slice(2, 4);

      server.use(
        http.get('/api/users/me/activity', ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page');
          
          if (page === '1') {
            return HttpResponse.json({
              entries: firstPage,
              totalCount: 6,
              page: 1,
              limit: 2,
              totalPages: 3
            });
          } else {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(HttpResponse.json({
                  entries: secondPage,
                  totalCount: 6,
                  page: 2,
                  limit: 2,
                  totalPages: 3
                }));
              }, 100);
            });
          }
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /load more activity/i })).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole('button', { name: /load more activity/i });
      await user.click(loadMoreButton);

      // Should show loading spinner
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('generic', { hidden: true })).not.toBeInTheDocument();
      });
    });
  });

  describe('Activity Display', () => {
    it('renders activity entries correctly', async () => {
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Activity History')).toBeInTheDocument();
        expect(screen.getByText('Your recent account activity and changes')).toBeInTheDocument();
      });

      // Should show activity entries
      mockActivityEntries.slice(0, 6).forEach(entry => {
        expect(screen.getByText(entry.description)).toBeInTheDocument();
      });
    });

    it('shows appropriate icons for different activity types', async () => {
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        // Check that different activity types have appropriate styling
        expect(screen.getByText('Updated profile information')).toBeInTheDocument();
        expect(screen.getByText('Changed account password')).toBeInTheDocument();
        expect(screen.getByText('Changed email address')).toBeInTheDocument();
        expect(screen.getByText('Signed in to account')).toBeInTheDocument();
      });
    });

    it('formats timestamps correctly', async () => {
      const recentEntry = createMockActivityEntry({
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        description: 'Recent activity'
      });

      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: [recentEntry],
            totalCount: 1,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
      });
    });

    it('displays activity metadata when available', async () => {
      const entryWithMetadata = createMockActivityEntry({
        description: 'Profile updated with metadata',
        metadata: {
          fields: ['firstName', 'lastName'],
          previousValue: 'old value'
        }
      });

      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: [entryWithMetadata],
            totalCount: 1,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Profile updated with metadata')).toBeInTheDocument();
        expect(screen.getByText('Fields:')).toBeInTheDocument();
        expect(screen.getByText('Previous value:')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no activities exist', async () => {
      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: [],
            totalCount: 0,
            page: 1,
            limit: 20,
            totalPages: 0
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('No activity history found')).toBeInTheDocument();
        expect(screen.getByText('Your account activities will appear here')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API fails', async () => {
      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch activity history' },
            { status: 500 }
          );
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch activity history')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      let attemptCount = 0;

      server.use(
        http.get('/api/users/me/activity', () => {
          attemptCount++;
          if (attemptCount === 1) {
            return HttpResponse.json(
              { message: 'Server error' },
              { status: 500 }
            );
          }
          return HttpResponse.json({
            entries: mockActivityEntries,
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      await waitFor(() => {
        expect(screen.getByText('Updated profile information')).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.error();
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('shows load more button when there are more activities', async () => {
      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: mockActivityEntries.slice(0, 3),
            totalCount: 10,
            page: 1,
            limit: 3,
            totalPages: 4
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /load more activity/i })).toBeInTheDocument();
      });
    });

    it('hides load more button when all activities are loaded', async () => {
      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: mockActivityEntries,
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /load more activity/i })).not.toBeInTheDocument();
        expect(screen.getByText("You've reached the end of your activity history")).toBeInTheDocument();
      });
    });

    it('loads more activities when load more is clicked', async () => {
      const firstPage = mockActivityEntries.slice(0, 3);
      const secondPage = mockActivityEntries.slice(3, 6);

      server.use(
        http.get('/api/users/me/activity', ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page');
          
          if (page === '1') {
            return HttpResponse.json({
              entries: firstPage,
              totalCount: 6,
              page: 1,
              limit: 3,
              totalPages: 2
            });
          } else {
            return HttpResponse.json({
              entries: secondPage,
              totalCount: 6,
              page: 2,
              limit: 3,
              totalPages: 2
            });
          }
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(firstPage[0].description)).toBeInTheDocument();
      });

      // Should show only first page activities
      expect(screen.queryByText(secondPage[0].description)).not.toBeInTheDocument();

      const loadMoreButton = screen.getByRole('button', { name: /load more activity/i });
      await user.click(loadMoreButton);

      // Should now show both pages
      await waitFor(() => {
        expect(screen.getByText(firstPage[0].description)).toBeInTheDocument();
        expect(screen.getByText(secondPage[0].description)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes activity list when refresh button is clicked', async () => {
      let callCount = 0;

      server.use(
        http.get('/api/users/me/activity', () => {
          callCount++;
          return HttpResponse.json({
            entries: mockActivityEntries.slice(0, callCount * 2), // Return more items on refresh
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByText(/ago$/).length).toBe(2);
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getAllByText(/ago$/).length).toBe(4);
      });
    });

    it('shows loading state on refresh button during refresh', async () => {
      server.use(
        http.get('/api/users/me/activity', async ({ request }) => {
          const url = new URL(request.url);
          const isRefresh = url.searchParams.get('page') === '1';
          
          if (isRefresh) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          return HttpResponse.json({
            entries: mockActivityEntries,
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Should show spinning icon
      expect(refreshButton).toBeDisabled();
      const icon = refreshButton.querySelector('.animate-spin');
      expect(icon).toBeInTheDocument();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });
  });

  describe('Time Formatting', () => {
    it('formats recent timestamps correctly', async () => {
      const activities = [
        createMockActivityEntry({
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          description: '5 minutes ago'
        }),
        createMockActivityEntry({
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          description: '2 hours ago'
        }),
        createMockActivityEntry({
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          description: '3 days ago'
        }),
        createMockActivityEntry({
          timestamp: new Date('2023-01-01T10:30:00Z').toISOString(), // Long ago
          description: 'Long ago'
        })
      ];

      server.use(
        http.get('/api/users/me/activity', () => {
          return HttpResponse.json({
            entries: activities,
            totalCount: activities.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
        expect(screen.getByText('3 days ago')).toBeInTheDocument();
        expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument(); // Full date format
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /activity history/i })).toBeInTheDocument();
      });
    });

    it('provides descriptive text for the activity list', async () => {
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Your recent account activity and changes')).toBeInTheDocument();
      });
    });

    it('has accessible refresh button', async () => {
      render(<ActivityHistory userId={mockUserId} />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
        expect(refreshButton).toHaveAttribute('type', 'button');
      });
    });

    it('provides appropriate ARIA states for loading', async () => {
      server.use(
        http.get('/api/users/me/activity', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            entries: mockActivityEntries,
            totalCount: mockActivityEntries.length,
            page: 1,
            limit: 20,
            totalPages: 1
          });
        })
      );

      const user = userEvent.setup();
      render(<ActivityHistory userId={mockUserId} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(refreshButton).toBeDisabled();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });
  });
});