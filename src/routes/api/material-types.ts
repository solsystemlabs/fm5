import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const ServerRoute = createServerFileRoute('/api/material-types').methods({
  GET: async ({ request }) => {
    try {
      const materialTypes = await prisma.materialType.findMany({
        orderBy: {
          name: 'asc',
        },
      })

      return Response.json(materialTypes)
    } catch (error) {
      console.error('Error fetching material types:', error)
      return Response.json({ error: 'Failed to fetch material types' }, { status: 500 })
    }
  },
})