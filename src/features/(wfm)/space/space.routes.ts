import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { SpaceController } from './space.controller'
import { SpaceSchemas } from './space.schemas'

export async function SpaceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.post('/', {
    preHandler: [Middlewares.permission('SPACES', 'CREATE')],
    schema: SpaceSchemas.create,
    handler: SpaceController.create,
  })

  fastify.get('/', {
    preHandler: [Middlewares.permission('SPACES', 'READ')],
    schema: SpaceSchemas.getAll,
    handler: SpaceController.getAll,
  })

  fastify.get('/:id', {
    preHandler: [Middlewares.permission('SPACES', 'READ')],
    schema: SpaceSchemas.getById,
    handler: SpaceController.getById,
  })

  fastify.put('/:id', {
    preHandler: [Middlewares.permission('SPACES', 'UPDATE')],
    schema: SpaceSchemas.update,
    handler: SpaceController.update,
  })

  fastify.delete('/:id', {
    preHandler: [Middlewares.permission('SPACES', 'DELETE')],
    schema: SpaceSchemas.remove,
    handler: SpaceController.remove,
  })

  fastify.get('/search', {
    preHandler: [Middlewares.permission('SPACES', 'READ')],
    schema: SpaceSchemas.getByQuery,
    handler: SpaceController.getByQuery,
  })
}
