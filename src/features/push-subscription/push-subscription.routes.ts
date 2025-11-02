import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { PushSubscriptionController } from './push-subscription.controller'
import { PushSubscriptionSchemas } from './push-subscription.schema'

export async function PushSubscriptionRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // Rotas autenticadas
  fastify.post('/', {
    schema: PushSubscriptionSchemas.create,

    handler: PushSubscriptionController.create,
  })

  fastify.delete('/:id', {
    schema: PushSubscriptionSchemas.delete,

    handler: PushSubscriptionController.delete,
  })

  fastify.get('/user/:userId', {
    handler: PushSubscriptionController.listByUser,
  })

  fastify.get('/vapid-key', {
    schema: PushSubscriptionSchemas.getVapidKey,
    handler: PushSubscriptionController.getVapidKey,
  })
}
