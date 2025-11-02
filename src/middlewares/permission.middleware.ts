/**
 * ================================
 * MIDDLEWARE DE PERMISSÕES
 * ================================
 *
 * Este middleware verifica e valida as permissões do usuário autenticado.
 * Bloqueia o acesso caso o usuário não tenha a permissão necessária.
 *
 * @param resource - Nome do recurso (ex: 'USERS', 'PRODUCTS', 'ORDERS')
 * @param action - Ação desejada (ex: 'CREATE', 'READ', 'UPDATE', 'DELETE')
 *
 * @example
 * // Em uma rota:
 * fastify.get('/users', {
 *   preHandler: Permission('USERS', 'READ'),
 *   handler: UserController.list
 * })
 */

import { db } from '@/plugins/prisma'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const Permission = (resource: string, action: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verifica se o usuário está autenticado
      if (!request.user?.id) {
        return reply.status(401).send({
          error: 'Unauthorized - User not authenticated',
        })
      }

      // Busca a permissão específica do usuário
      const hasPermission = await db.userPermission.findFirst({
        where: {
          userId: request.user.id,
          resource: resource,
          action: action,
        },
      })

      // Se não tiver a permissão, bloqueia o acesso
      if (!hasPermission) {
        return reply.status(403).send({
          error: 'Forbidden - Insufficient permissions',
          details: `Required permission: ${action} on ${resource}`,
        })
      }

      // Se tiver a permissão, continua o fluxo
      // (não retorna nada, deixa o Fastify continuar)
    } catch (error: unknown) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  }
}
