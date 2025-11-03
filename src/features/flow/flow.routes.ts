import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { FlowController } from './flow.controller'
import { FlowSchemas } from './flow.schema'

export async function FlowRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: FlowSchemas.create,
    handler: FlowController.create,
  })

  fastify.get('/', {
    schema: FlowSchemas.list,
    handler: FlowController.list,
  })

  fastify.get('/stats', {
    handler: FlowController.getStats,
  })

  fastify.get('/search', {
    handler: FlowController.search,
  })

  fastify.get('/store', {
    handler: FlowController.getByStore,
  })

  fastify.get('/:id', {
    schema: FlowSchemas.get,
    handler: FlowController.get,
  })

  fastify.put('/:id', {
    schema: FlowSchemas.update,
    handler: FlowController.update,
  })

  fastify.delete('/:id', {
    schema: FlowSchemas.delete,
    handler: FlowController.delete,
  })

  // Funções adicionais
  fastify.patch('/:id/status', {
    schema: FlowSchemas.updateStatus,
    handler: FlowController.updateStatus,
  })

  fastify.post('/:id/duplicate', {
    schema: FlowSchemas.duplicate,
    handler: FlowController.duplicate,
  })

  fastify.post('/:id/test', {
    schema: FlowSchemas.test,
    handler: FlowController.test,
  })
}
