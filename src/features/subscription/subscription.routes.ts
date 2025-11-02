import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionSchemas } from './subscription.schema'

export async function SubscriptionRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: SubscriptionSchemas.create,
    handler: SubscriptionController.create,
  })

  fastify.get('/', {
    schema: SubscriptionSchemas.list,
    handler: SubscriptionController.list,
  })

  fastify.get('/:id', {
    schema: SubscriptionSchemas.get,
    handler: SubscriptionController.get,
  })

  fastify.put('/:id', {
    schema: SubscriptionSchemas.update,
    handler: SubscriptionController.update,
  })

  fastify.delete('/:id', {
    schema: SubscriptionSchemas.delete,
    handler: SubscriptionController.delete,
  })

  fastify.delete('/:id/force', {
    schema: SubscriptionSchemas.delete,
    handler: SubscriptionController.forceDelete,
  })

  // Funções adicionais
  fastify.get('/active', {
    handler: SubscriptionController.getActive,
  })

  fastify.get('/stats', {
    handler: SubscriptionController.getStats,
  })

  fastify.get('/compare', {
    schema: SubscriptionSchemas.compare,
    handler: SubscriptionController.compare,
  })

  fastify.get('/:id/customers', {
    schema: SubscriptionSchemas.getCustomers,
    handler: SubscriptionController.getCustomers,
  })

  fastify.patch('/:id/status', {
    schema: SubscriptionSchemas.updateStatus,
    handler: SubscriptionController.updateStatus,
  })
}
