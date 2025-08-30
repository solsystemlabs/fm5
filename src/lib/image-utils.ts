/**
 * Image utilities for handling S3 CORS issues in development
 */

/**
 * Check if URL is an S3 URL that needs proxying
 */
export function isS3Url(url: string): boolean {
  return url.includes('solsystemlabs.s3.us-east-2.amazonaws.com') || 
         url.includes('.s3.amazonaws.com') ||
         url.includes('s3.amazonaws.com');
}

/**
 * Get a properly formatted image URL, using proxy for S3 URLs in development
 */
export function getImageUrl(url: string): string {
  // In development, proxy S3 URLs to avoid CORS issues
  if (typeof window !== 'undefined' && isS3Url(url)) {
    const currentOrigin = window.location.origin;
    return `${currentOrigin}/api/proxy/image?url=${encodeURIComponent(url)}`;
  }
  
  // Return original URL (for external services like picsum, or in production)
  return url;
}

/**
 * Get image URL with fallback handling
 */
export function getImageSrc(preview: string | undefined, url: string): string {
  // Use preview (blob URL) if available, otherwise process the main URL
  return preview || getImageUrl(url);
}