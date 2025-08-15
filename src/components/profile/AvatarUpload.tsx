import { Avatar, AvatarFallback, AvatarImage } from "@/components/aria/avatar";
import { Button } from "@/components/aria/button";
import { Card, CardContent } from "@/components/aria/card";
import { useState, useRef } from "react";
import { Upload, Camera, Trash2, User } from "lucide-react";

interface AvatarUploadProps {
  currentImage?: string;
  onUploadSuccess: (imageUrl: string) => void;
}

export function AvatarUpload({ currentImage, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      onUploadSuccess(data.imageUrl);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete avatar');
      }

      onUploadSuccess(''); // Clear the avatar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentImage;
  const hasImage = Boolean(displayImage);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <Avatar className="w-24 h-24 ring-2 ring-gray-200">
          <AvatarImage 
            src={displayImage} 
            alt="Profile" 
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100 text-gray-500">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-b-transparent"></div>
          </div>
        )}

        {/* Hover Overlay */}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer" onClick={triggerFileSelect}>
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="w-full max-w-sm">
          <CardContent className="p-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Click on the avatar or use the buttons below to upload a new photo
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG, or GIF. Max size 5MB.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onPress={triggerFileSelect}
          isDisabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>

        {hasImage && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleDeleteAvatar}
            isDisabled={uploading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload avatar image"
      />

      {/* Preview Info */}
      {preview && (
        <Card className="w-full max-w-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-600">
                {uploading ? 'Uploading your new avatar...' : 'Preview ready'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Features */}
      <div className="sr-only">
        <p>Current avatar image: {hasImage ? 'Uploaded image' : 'Default avatar'}</p>
        <p>
          To change your avatar, click the upload button and select an image file.
          Supported formats are JPG, PNG, and GIF with a maximum size of 5MB.
        </p>
      </div>
    </div>
  );
}