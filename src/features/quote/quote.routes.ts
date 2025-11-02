import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { QuoteController } from './quote.controller'
import { QuoteSchemas } from './quote.schema'

export async function QuoteRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)
  // === ROTAS AUTENTICADAS ===

  // CRUD básico
  fastify.post('/', {
    schema: QuoteSchemas.create,
    handler: QuoteController.create,
  })

  fastify.get('/', {
    schema: QuoteSchemas.list,
    handler: QuoteController.list,
  })

  fastify.get('/:id', {
    schema: QuoteSchemas.get,
    handler: QuoteController.get,
  })

  fastify.put('/:id', {
    schema: QuoteSchemas.update,
    handler: QuoteController.update,
  })

  fastify.delete('/:id', {
    schema: QuoteSchemas.delete,

    handler: QuoteController.delete,
  })

  // Funções adicionais
  fastify.patch('/:id/status', {
    schema: QuoteSchemas.updateStatus,

    handler: QuoteController.updateStatus,
  })

  fastify.patch<{ Params: { id: string } }>('/:id/publish', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },

    handler: QuoteController.publish,
  })

  fastify.patch<{ Params: { id: string } }>('/:id/send', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },

    handler: QuoteController.send,
  })

  fastify.post('/:id/convert', {
    schema: QuoteSchemas.convertToMovement,

    handler: QuoteController.convertToMovements,
  })

  fastify.get('/stats', {
    schema: QuoteSchemas.getStats,

    handler: QuoteController.getStats,
  })

  fastify.get<{ Params: { userId: string } }>('/user/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          status: {
            type: 'string',
            enum: [
              'DRAFT',
              'PUBLISHED',
              'SENT',
              'VIEWED',
              'APPROVED',
              'REJECTED',
              'EXPIRED',
              'CONVERTED',
              'CANCELED',
            ],
          },
        },
      },
    },

    handler: QuoteController.getByUser,
  })

  fastify.get('/status/:status', {
    schema: {
      params: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: [
              'DRAFT',
              'PUBLISHED',
              'SENT',
              'VIEWED',
              'APPROVED',
              'REJECTED',
              'EXPIRED',
              'CONVERTED',
              'CANCELED',
            ],
          },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          userId: { type: 'string' },
        },
      },
    },

    handler: QuoteController.getByStatus,
  })

  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          userId: { type: 'string' },
        },
      },
    },

    handler: QuoteController.search,
  })

  fastify.get('/recent', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 5 },
          userId: { type: 'string' },
        },
      },
    },

    handler: QuoteController.getRecent,
  })

  fastify.get('/:id/analytics', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },

    handler: QuoteController.getAnalytics,
  })

  fastify.post('/mark-expired', {
    handler: QuoteController.markExpired,
  })

  // === ROTAS PÚBLICAS (sem autenticação) ===

  fastify.get('/public/:publicId', {
    schema: QuoteSchemas.getPublic,
    handler: QuoteController.getPublic,
  })

  fastify.post('/public/:publicId/approve', {
    schema: QuoteSchemas.approve,
    handler: QuoteController.approvePublic,
  })

  fastify.post('/public/:publicId/reject', {
    schema: QuoteSchemas.reject,
    handler: QuoteController.rejectPublic,
  })
}
