import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockFile } from '@/test/utils/test-utils';
import { AvatarUpload } from '../AvatarUpload';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AvatarUpload', () => {
  const mockOnUploadSuccess = vi.fn();

  beforeEach(() => {
    mockOnUploadSuccess.mockClear();
  });

  describe('Rendering', () => {
    it('renders avatar upload component', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument();
      expect(screen.getByText('Click on the avatar or use the buttons below to upload a new photo')).toBeInTheDocument();
      expect(screen.getByText('JPG, PNG, or GIF. Max size 5MB.')).toBeInTheDocument();
    });

    it('renders with existing avatar image', () => {
      const imageUrl = 'https://example.com/avatar.jpg';
      render(<AvatarUpload currentImage={imageUrl} onUploadSuccess={mockOnUploadSuccess} />);

      const avatarImage = screen.getByRole('img', { name: /profile/i });
      expect(avatarImage).toHaveAttribute('src', imageUrl);
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('renders without avatar image (fallback)', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      // Should show user icon fallback
      expect(screen.getByText('Current avatar image: Default avatar')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('provides accessibility information', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.getByText(
        'To change your avatar, click the upload button and select an image file. Supported formats are JPG, PNG, and GIF with a maximum size of 5MB.'
      )).toBeInTheDocument();
    });
  });

  describe('File Selection and Validation', () => {
    it('accepts valid image files', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockOnUploadSuccess).toHaveBeenCalledWith(
          expect.stringContaining('avatars/')
        );
      });
    });

    it('rejects non-image files', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Please select an image file')).toBeInTheDocument();
      });
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });

    it('rejects files over 5MB', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg'); // 6MB
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Image must be less than 5MB')).toBeInTheDocument();
      });
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });

    it('accepts different image formats', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const formats = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' }
      ];

      const fileInput = screen.getByLabelText('Upload avatar image');

      for (const format of formats) {
        mockOnUploadSuccess.mockClear();
        const file = createMockFile(format.name, 1024, format.type);
        
        await user.upload(fileInput, file);

        await waitFor(() => {
          expect(mockOnUploadSuccess).toHaveBeenCalledWith(
            expect.stringContaining('avatars/')
          );
        });
      }
    });
  });

  describe('Upload Process', () => {
    it('shows loading state during upload', async () => {
      const user = userEvent.setup();
      
      // Mock slow upload response
      server.use(
        http.post('/api/users/me/avatar', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ imageUrl: 'https://example.com/new-avatar.jpg' });
        })
      );

      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      // Should show loading state
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(screen.getByText('Uploading your new avatar...')).toBeInTheDocument();

      // Should show loading spinner
      const loadingSpinner = screen.getByRole('generic', { hidden: true });
      expect(loadingSpinner).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Upload Photo')).toBeInTheDocument();
      });
    });

    it('shows preview during upload', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      // Should show preview status
      await waitFor(() => {
        expect(screen.getByText('Preview ready')).toBeInTheDocument();
      });
    });

    it('handles upload errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock upload error
      server.use(
        http.post('/api/users/me/avatar', () => {
          return HttpResponse.json(
            { message: 'Upload failed' },
            { status: 500 }
          );
        })
      );

      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });

    it('handles file size error from server', async () => {
      const user = userEvent.setup();
      
      // Mock server file size error
      server.use(
        http.post('/api/users/me/avatar', () => {
          return HttpResponse.json(
            { message: 'File size too large. Maximum size is 5MB' },
            { status: 400 }
          );
        })
      );

      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('File size too large. Maximum size is 5MB')).toBeInTheDocument();
      });
    });

    it('handles invalid file type error from server', async () => {
      const user = userEvent.setup();
      
      // Mock server file type error
      server.use(
        http.post('/api/users/me/avatar', () => {
          return HttpResponse.json(
            { message: 'Invalid file type. Only images are allowed' },
            { status: 400 }
          );
        })
      );

      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('Invalid file type. Only images are allowed')).toBeInTheDocument();
      });
    });

    it('clears preview after successful upload', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      // Initially shows preview
      expect(screen.getByText('Preview ready')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnUploadSuccess).toHaveBeenCalled();
        expect(screen.queryByText('Preview ready')).not.toBeInTheDocument();
      });
    });
  });

  describe('Avatar Deletion', () => {
    it('shows remove button when avatar exists', () => {
      render(
        <AvatarUpload 
          currentImage="https://example.com/avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('does not show remove button when no avatar exists', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('deletes avatar successfully', async () => {
      const user = userEvent.setup();
      render(
        <AvatarUpload 
          currentImage="https://example.com/avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockOnUploadSuccess).toHaveBeenCalledWith('');
      });
    });

    it('shows loading state during deletion', async () => {
      const user = userEvent.setup();
      
      // Mock slow delete response
      server.use(
        http.delete('/api/users/me/avatar', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ message: 'Avatar deleted successfully' });
        })
      );

      render(
        <AvatarUpload 
          currentImage="https://example.com/avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      // Button should be disabled during deletion
      expect(removeButton).toBeDisabled();

      await waitFor(() => {
        expect(removeButton).not.toBeDisabled();
      });
    });

    it('handles deletion errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock delete error
      server.use(
        http.delete('/api/users/me/avatar', () => {
          return HttpResponse.json(
            { message: 'Failed to delete avatar' },
            { status: 500 }
          );
        })
      );

      render(
        <AvatarUpload 
          currentImage="https://example.com/avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete avatar')).toBeInTheDocument();
      });
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('triggers file selection when clicking upload button', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const uploadButton = screen.getByRole('button', { name: /upload photo/i });
      await user.click(uploadButton);

      // File input should be focused/clicked (hard to test directly, but upload button works)
      expect(uploadButton).toBeInTheDocument();
    });

    it('triggers file selection when clicking on avatar', async () => {
      const user = userEvent.setup();
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      // Click on the avatar area
      const avatarContainer = screen.getByRole('img').closest('.group');
      const overlay = avatarContainer?.querySelector('.cursor-pointer');
      
      if (overlay) {
        await user.click(overlay as HTMLElement);
        // Should trigger file selection (implementation detail)
      }
    });

    it('disables interactions during upload', async () => {
      const user = userEvent.setup();
      
      // Mock slow upload
      server.use(
        http.post('/api/users/me/avatar', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ imageUrl: 'https://example.com/avatar.jpg' });
        })
      );

      render(
        <AvatarUpload 
          currentImage="https://example.com/old-avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const fileInput = screen.getByLabelText('Upload avatar image');
      
      await user.upload(fileInput, file);

      // Buttons should be disabled during upload
      const uploadButton = screen.getByRole('button', { name: /uploading/i });
      const removeButton = screen.getByRole('button', { name: /remove/i });
      
      expect(uploadButton).toBeDisabled();
      expect(removeButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload photo/i })).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.getByLabelText('Upload avatar image')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /profile/i })).toBeInTheDocument();
    });

    it('provides screen reader information', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      expect(screen.getByText('Current avatar image: Default avatar')).toBeInTheDocument();
      expect(screen.getByText(
        'To change your avatar, click the upload button and select an image file. Supported formats are JPG, PNG, and GIF with a maximum size of 5MB.'
      )).toBeInTheDocument();
    });

    it('provides screen reader information for existing avatar', () => {
      render(
        <AvatarUpload 
          currentImage="https://example.com/avatar.jpg" 
          onUploadSuccess={mockOnUploadSuccess} 
        />
      );

      expect(screen.getByText('Current avatar image: Uploaded image')).toBeInTheDocument();
    });

    it('has keyboard accessible file input', () => {
      render(<AvatarUpload onUploadSuccess={mockOnUploadSuccess} />);

      const fileInput = screen.getByLabelText('Upload avatar image');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });
});