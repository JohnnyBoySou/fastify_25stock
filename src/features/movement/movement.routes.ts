import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { MovementController } from './movement.controller'
import { MovementSchemas } from './movement.schema'

export async function MovementRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: MovementSchemas.create,

    handler: MovementController.create,
  })

  fastify.get('/', {
    schema: MovementSchemas.list,

    handler: MovementController.list,
  })

  // === NOVOS ENDPOINTS ESPECÍFICOS ===
  // Listar movimentações da loja do usuário autenticado
  fastify.get('/my-store', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          search: { type: 'string' },
          type: { type: 'string', enum: ['ENTRADA', 'SAIDA', 'PERDA'] },
          productId: { type: 'string' },
          supplierId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },

    handler: MovementController.listByStore,
  })

  // Listar movimentações por produto específico na loja do usuário
  fastify.get('/my-store/product/:productId', {
    schema: {
      params: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', minLength: 1 },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
          type: { type: 'string', enum: ['ENTRADA', 'SAIDA', 'PERDA'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },

    handler: MovementController.listByProduct,
  })

  fastify.get('/:id', {
    schema: MovementSchemas.get,

    handler: MovementController.get,
  })

  fastify.put('/:id', {
    schema: MovementSchemas.update,

    handler: MovementController.update,
  })

  fastify.delete('/:id', {
    schema: MovementSchemas.delete,

    handler: MovementController.delete,
  })

  // Consultas por entidade
  fastify.get('/store/:storeId', {
    schema: MovementSchemas.getByStore,
    handler: MovementController.getByStore,
  })

  fastify.get('/product/:productId', {
    schema: MovementSchemas.getByProduct,

    handler: MovementController.getByProduct,
  })

  fastify.get('/product/:productId/summary', {
    handler: MovementController.summarizeProduct,
  })

  fastify.get('/supplier/:supplierId', {
    schema: MovementSchemas.getBySupplier,
    handler: MovementController.getBySupplier,
  })

  // Histórico de estoque
  fastify.get('/stock-history/:productId/:storeId', {
    schema: MovementSchemas.getStockHistory,
    handler: MovementController.getStockHistory,
  })

  // Estoque atual
  fastify.get('/current-stock/:productId/:storeId', {
    handler: MovementController.getCurrentStock,
  })

  // Relatórios e estatísticas
  fastify.get('/stats', {
    handler: MovementController.getStats,
  })

  fastify.get('/search', {
    handler: MovementController.search,
  })

  fastify.get('/low-stock', {
    handler: MovementController.getLowStockProducts,
  })

  // Comandos especiais
  fastify.post('/recalculate-stock/:productId/:storeId', {
    handler: MovementController.recalculateStock,
  })

  fastify.get('/summarize', {
    handler: MovementController.summarize,
  })

  // === ENDPOINTS PARA ALERTAS DE ESTOQUE ===
  fastify.get('/stock-alerts', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          storeId: { type: 'string' },
        },
      },
    },

    handler: MovementController.checkStockAlerts,
  })

  fastify.post('/stock-alerts/summary', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          storeId: { type: 'string' },
        },
      },
    },

    handler: MovementController.createLowStockSummaryNotification,
  })
}
