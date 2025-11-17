import type { FastifyInstance } from 'fastify'
import { SupportController } from './support.controller'
import { SupportSchemas } from './support.schema'
import { Middlewares } from '@/middlewares'

export async function SupportRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.post('/', {
    schema: SupportSchemas.create,
    handler: SupportController.create,
  })

  fastify.get('/', {
    schema: SupportSchemas.findByAll,
    handler: SupportController.findByAll,
  })

  fastify.get('/:id', {
    schema: SupportSchemas.findById,
    handler: SupportController.findById,
  })

  fastify.put('/:id', {
    schema: SupportSchemas.update,
    handler: SupportController.update,
  })

  fastify.delete('/:id', {
    schema: SupportSchemas.remove,
    handler: SupportController.remove,
  })
  
  fastify.delete('/bulk-remove', {
    schema: SupportSchemas.bulkRemove,
    handler: SupportController.bulkRemove,
  })

  fastify.get('/search', {
    schema: SupportSchemas.findByQuery,
    handler: SupportController.findByQuery,
  })

}
