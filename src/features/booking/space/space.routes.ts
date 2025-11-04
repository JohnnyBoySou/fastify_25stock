import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { SpaceController } from './space.controller'
import { SpaceSchemas } from './space.schemas'

export async function SpaceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.post('/', {
    schema: SpaceSchemas.create,
    handler: SpaceController.create,
  })

  fastify.get('/', {
    schema: SpaceSchemas.getAll,
    handler: SpaceController.getAll,
  })

  fastify.get('/:id', {
    schema: SpaceSchemas.getById,
    handler: SpaceController.getById,
  })

  fastify.put('/:id', {
    schema: SpaceSchemas.update,
    handler: SpaceController.update,
  })

  fastify.delete('/:id', {
    schema: SpaceSchemas.remove,
    handler: SpaceController.remove,
  })

  fastify.get('/search', {
    schema: SpaceSchemas.getByQuery,
    handler: SpaceController.getByQuery,
  })
}
