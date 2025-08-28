import { initTRPC } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Create context for tRPC
export function createTRPCContext() {
  return {
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Common error handler
export const handlePrismaError = (error: unknown, fallbackMessage: string) => {
  console.error(fallbackMessage, error);
  
  if (error instanceof z.ZodError) {
    throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
  }
  
  // Handle common Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'P2002':
        throw new Error('A record with this information already exists');
      case 'P2025':
        throw new Error('Record not found');
      case 'P2003':
        throw new Error('Foreign key constraint failed');
      default:
        throw new Error(fallbackMessage);
    }
  }
  
  throw new Error(fallbackMessage);
};