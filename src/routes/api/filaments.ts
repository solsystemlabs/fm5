import { createServerFileRoute } from '@tanstack/react-start/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createFilamentSchema = z.object({
  color: z.string().min(1, 'Color is required'),
  materialTypeId: z.string().min(1, 'Material type is required'),
  modelId: z.string().optional(),
})

export const ServerRoute = createServerFileRoute('/api/filaments').methods({
  GET: async ({ request }) => {
    try {
      const filaments = await prisma.filament.findMany({
        include: {
          material: true,
          Model: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          color: 'asc',
        },
      })

      return Response.json(filaments)
    } catch (error) {
      console.error('Error fetching filaments:', error)
      return Response.json({ error: 'Failed to fetch filaments' }, { status: 500 })
    }
  },
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = createFilamentSchema.parse(body)

      const filament = await prisma.filament.create({
        data: {
          id: crypto.randomUUID(),
          color: validatedData.color,
          materialTypeId: validatedData.materialTypeId,
          modelId: validatedData.modelId || null,
        },
        include: {
          material: true,
          Model: {
            include: {
              category: true,
            },
          },
        },
      })

      return Response.json(filament, { status: 201 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
      }
      console.error('Error creating filament:', error)
      return Response.json({ error: 'Failed to create filament' }, { status: 500 })
    }
  },
})