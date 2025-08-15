import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

export const ServerRoute = createServerFileRoute('/api/users/me').methods({
  GET: async ({ request }) => {
    try {
      // Get the current session using Better Auth API
      const session = await auth.api.getSession({
        headers: request.headers
      })
      
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const prisma = new PrismaClient()
      
      try {
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: session.user.id }
        })

        if (!user) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { 
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }

        // Create profile response with mock data for fields not in current schema
        const profileResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          profile: {
            bio: null, // Will be added to schema later
            firstName: null,
            lastName: null,
            phoneNumber: null,
            dateOfBirth: null,
            location: null,
            website: null,
            profileViews: 0,
            isPublic: true,
            lastProfileEdit: null,
          },
          settings: {
            emailNotifications: true,
            pushNotifications: true,
            profileVisibility: 'PUBLIC',
            language: 'en',
            timezone: 'UTC',
            theme: 'SYSTEM',
            marketingEmails: false,
          }
        }

        return new Response(
          JSON.stringify(profileResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )

      } finally {
        await prisma.$disconnect()
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },

  PUT: async ({ request }) => {
    try {
      // Get the current session using Better Auth API
      const session = await auth.api.getSession({
        headers: request.headers
      })
      
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const updateData = await request.json()
      const prisma = new PrismaClient()
      
      try {
        // Update only the fields that exist in current schema
        const updatedUser = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            name: updateData.name || undefined,
            // Note: profile fields will be ignored until schema is extended
          }
        })

        // Return updated profile with mock data for extended fields
        const profileResponse = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          image: updatedUser.image,
          emailVerified: updatedUser.emailVerified,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
          profile: {
            bio: updateData.profile?.bio || null,
            firstName: updateData.profile?.firstName || null,
            lastName: updateData.profile?.lastName || null,
            phoneNumber: updateData.profile?.phoneNumber || null,
            dateOfBirth: updateData.profile?.dateOfBirth || null,
            location: updateData.profile?.location || null,
            website: updateData.profile?.website || null,
            profileViews: 0,
            isPublic: updateData.profile?.isPublic ?? true,
            lastProfileEdit: new Date().toISOString(),
          },
          settings: {
            emailNotifications: true,
            pushNotifications: true,
            profileVisibility: 'PUBLIC',
            language: 'en',
            timezone: 'UTC',
            theme: 'SYSTEM',
            marketingEmails: false,
          }
        }

        return new Response(
          JSON.stringify(profileResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )

      } finally {
        await prisma.$disconnect()
      }

    } catch (error) {
      console.error('Error updating user profile:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
})