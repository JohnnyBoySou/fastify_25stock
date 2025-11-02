import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { DocumentController } from './document.controller'
import { DocumentSchemas } from './document.schemas'

export async function DocumentRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: DocumentSchemas.create,
    handler: DocumentController.create,
  })

  fastify.get('/', {
    schema: DocumentSchemas.list,
    handler: DocumentController.list,
  })

  fastify.get('/:id', {
    schema: DocumentSchemas.get,
    handler: DocumentController.get,
  })

  fastify.put('/:id', {
    schema: DocumentSchemas.update,
    handler: DocumentController.update,
  })

  fastify.delete('/:id', {
    schema: DocumentSchemas.delete,
    handler: DocumentController.delete,
  })

  fastify.get('/search', {
    schema: DocumentSchemas.search,
    handler: DocumentController.search,
  })

  // Funções adicionais
  fastify.get('/folder/:folderId', {
    handler: DocumentController.getByFolder,
  })

  fastify.get('/pinned/list', {
    handler: DocumentController.getPinned,
  })

  fastify.get('/stats/summary', {
    handler: DocumentController.getStats,
  })

  fastify.patch('/:id/toggle-pinned', {
    handler: DocumentController.togglePinned,
  })
}