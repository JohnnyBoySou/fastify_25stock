import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { CategoryController } from './category.controller'
import { CategorySchemas } from './category.schema'

export async function CategoryRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: CategorySchemas.create,
    handler: CategoryController.create,
  })

  fastify.get('/', {
    schema: CategorySchemas.list,
    handler: CategoryController.list,
  })

  // Bulk operations
  fastify.post('/bulk-delete', {
    schema: CategorySchemas.bulkDelete,
    handler: CategoryController.bulkDelete,
  })

  fastify.get('/:id', {
    schema: CategorySchemas.get,
    handler: CategoryController.get,
  })

  fastify.put('/:id', {
    schema: CategorySchemas.update,
    handler: CategoryController.update,
  })

  fastify.delete('/:id', {
    schema: CategorySchemas.delete,
    handler: CategoryController.delete,
  })

  // Funções adicionais - Queries
  fastify.get('/active', {
    handler: CategoryController.getActive,
  })

  fastify.get('/stats', {
    handler: CategoryController.getStats,
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
    handler: CategoryController.search,
  })

  fastify.get('/root', {
    schema: CategorySchemas.getRoot,
    handler: CategoryController.getRootCategories,
  })

  fastify.get('/:id/children', {
    schema: CategorySchemas.getChildren,
    handler: CategoryController.getChildren,
  })

  fastify.get('/hierarchy', {
    handler: CategoryController.getHierarchy,
  })

  fastify.get('/code/:code', {
    schema: {
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
        required: ['code'],
      },
    },
    handler: CategoryController.getByCode,
  })

  // Funções adicionais - Commands
  fastify.patch('/:id/status', {
    schema: CategorySchemas.updateStatus,
    handler: CategoryController.updateStatus,
  })

  fastify.patch('/:id/move', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          parentId: { type: 'string', nullable: true },
        },
      },
    },
    handler: CategoryController.moveToParent,
  })

  // === RELATÓRIOS ===
  fastify.get('/reports/top-by-products', {
    schema: CategorySchemas.getTopCategoriesByProducts,
    handler: CategoryController.getTopCategoriesByProducts,
  })

  fastify.get('/reports/creation-evolution', {
    schema: CategorySchemas.getCategoryCreationEvolution,
    handler: CategoryController.getCategoryCreationEvolution,
  })

  fastify.get('/reports/active-inactive-ratio', {
    schema: CategorySchemas.getActiveInactiveRatio,
    handler: CategoryController.getActiveInactiveRatio,
  })

  fastify.get('/reports/active-inactive-trend', {
    schema: CategorySchemas.getActiveInactiveTrend,
    handler: CategoryController.getActiveInactiveTrend,
  })
}
