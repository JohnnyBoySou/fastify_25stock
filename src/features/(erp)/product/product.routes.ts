import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ProductController } from './product.controller'
import { ProductSchemas } from './product.schema'

export async function ProductRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: ProductSchemas.create,
    handler: ProductController.create,
  })

  fastify.get('/', {
    schema: ProductSchemas.list,
    handler: ProductController.list,
  })

  fastify.get('/:id', {
    schema: ProductSchemas.get,
    handler: ProductController.get,
  })

  fastify.put('/:id', {
    schema: ProductSchemas.update,
    handler: ProductController.update,
  })

  fastify.delete('/:id', {
    schema: ProductSchemas.delete,
    handler: ProductController.delete,
  })

  fastify.delete('/:id/force', {
    schema: ProductSchemas.delete,
    handler: ProductController.forceDelete,
  })

  fastify.get('/active', {
    handler: ProductController.getActive,
  })

  fastify.get('/stats', {
    handler: ProductController.getStats,
  })

  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          limit: { type: 'number' },
        },
        required: ['q'],
      },
    },

    handler: ProductController.search,
  })

  fastify.post('/bulk-delete', {
    schema: ProductSchemas.bulkDelete,

    handler: ProductController.bulkDelete,
  })

  fastify.patch('/:id/status', {
    schema: ProductSchemas.updateStatus,
    handler: ProductController.updateStatus,
  })
}
