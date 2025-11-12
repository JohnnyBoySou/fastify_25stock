import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { StoreController } from './store.controller'
import { StoreSchemas } from './store.schema'

export async function StoreRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    schema: StoreSchemas.create,
    preHandler: [Middlewares.auth],
    handler: StoreController.create,
  })

  fastify.get('/', {
    preHandler: [Middlewares.auth, Middlewares.store],
    handler: StoreController.get,
  })

  fastify.put('/', {
    schema: StoreSchemas.update,
    preHandler: [Middlewares.auth, Middlewares.store],
    handler: StoreController.update,
  })

  fastify.delete('/', {
    schema: StoreSchemas.delete,
    preHandler: [Middlewares.auth, Middlewares.store],
    handler: StoreController.delete,
  })

  fastify.get('/stats', {
    preHandler: [Middlewares.auth, Middlewares.store],
    handler: StoreController.getStats,
  })
}
