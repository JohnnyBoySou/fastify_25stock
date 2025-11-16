import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { FolderController } from './folder.controller'
import { FolderSchemas } from './folder.schemas'

export async function FolderRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: FolderSchemas.create,
    handler: FolderController.create,
  })

  fastify.get('/', {
    schema: FolderSchemas.list,
    handler: FolderController.list,
  })

  fastify.get('/:id', {
    schema: FolderSchemas.get,
    handler: FolderController.get,
  })

  fastify.put('/:id', {
    schema: FolderSchemas.update,
    handler: FolderController.update,
  })

  fastify.delete('/:id', {
    schema: FolderSchemas.delete,
    handler: FolderController.delete,
  })

  // Funções adicionais
  fastify.get('/search', {
    schema: FolderSchemas.search,
    handler: FolderController.search,
  })

  fastify.get('/tree/list', {
    handler: FolderController.getTree,
  })

  fastify.get('/stats/summary', {
    handler: FolderController.getStats,
  })
}
