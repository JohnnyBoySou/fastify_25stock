// src/types/fastify.d.ts
import type { AuthUser } from '@/features/auth/auth.interfaces'
import type { PrismaClient } from '@/generated/prisma'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }

  interface FastifyRequest {
    /** Usuário autenticado via JWT */
    user?: Omit<AuthUser, 'password'>

    /** Token JWT puro extraído do header Authorization */
    token?: string

    /** Dados básicos da store associada à requisição */
    store?: {
      id: string
      name: string
      ownerId: string
    }
  }
}
