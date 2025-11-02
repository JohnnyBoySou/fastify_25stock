/**
 * ================================
 * MIDDLEWARE DE CONTEXTO DE STORE
 * ================================
 *
 * Este middleware identifica e anexa a loja do usuário autenticado ao request.
 * Automaticamente adiciona storeId ao body se não fornecido.
 *
 * Retorna a loja do usuário autenticado.
 */

import { db } from '@/plugins/prisma'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const Store = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const store = await db.store.findFirst({
      where: {
        OR: [{ ownerId: request.user?.id }, { users: { some: { id: request.user?.id } } }],
      },
      select: { id: true, name: true },
    })

    if (!store) {
      return reply.status(404).send({
        error: 'Store not found for this user',
      })
    }

    request.store = store as { id: string; name: string; ownerId: string }

    return
  } catch (error: unknown) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Internal server error',
    })
  }
}
