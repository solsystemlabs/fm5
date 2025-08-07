import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const ServerRoute = createServerFileRoute('/api/models').methods({
  GET: async ({ request }) => {
    try {
      const models = await prisma.model.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      })

      return Response.json(models)
    } catch (error) {
      console.error('Error fetching models:', error)
      return Response.json({ error: 'Failed to fetch models' }, { status: 500 })
    }
  },
})