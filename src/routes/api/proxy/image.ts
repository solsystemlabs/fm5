import { createServerFileRoute } from '@tanstack/react-start/server'

/**
 * Image proxy for development to handle CORS issues with S3
 * Proxies image requests to avoid CORS blocking
 */
export const ServerRoute = createServerFileRoute('/api/proxy/image')
  .methods({
    GET: async ({ request }) => {
      const url = new URL(request.url);
      const imageUrl = url.searchParams.get('url');
      
      if (!imageUrl) {
        return new Response('Missing url parameter', { status: 400 });
      }
      
      try {
        // Validate that it's an S3 URL we own
        if (!imageUrl.includes('solsystemlabs.s3.us-east-2.amazonaws.com')) {
          return new Response('Invalid image source', { status: 400 });
        }
        
        // Fetch the image from S3
        const imageResponse = await fetch(imageUrl);
        
        if (!imageResponse.ok) {
          return new Response('Image not found', { status: 404 });
        }
        
        // Return the image with proper CORS headers
        const imageData = await imageResponse.arrayBuffer();
        
        return new Response(imageData, {
          status: 200,
          headers: {
            'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          },
        });
      } catch (error) {
        console.error('Image proxy error:', error);
        return new Response('Failed to fetch image', { status: 500 });
      }
    },
  });