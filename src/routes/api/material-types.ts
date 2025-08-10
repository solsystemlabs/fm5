import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createMaterialTypeSchema = z.object({
  name: z.string().min(1, 'Material type name is required'),
})

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

  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = createMaterialTypeSchema.parse(body)

      const materialType = await prisma.materialType.create({
        data: {
          name: validatedData.name,
        },
      })

      return Response.json(materialType, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 },
        )
      }
      console.error('Error creating material type:', error)
      return Response.json(
        { error: 'Failed to create material type' },
        { status: 500 },
      )
    }
  },
})