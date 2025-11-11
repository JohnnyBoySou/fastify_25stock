import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { CrmController } from './crm.controller'
import { CrmSchemas } from './crm.schema'

export async function CrmRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // === ROTAS DE CLIENTES ===

  // Rota de teste temporária
  fastify.get('/test-grouped', {
    handler: CrmController.testGrouped,
  })

  // CRUD básico de clientes
  fastify.post('/clients', {
    schema: CrmSchemas.createClient,
    handler: CrmController.createClient,
  })

  fastify.get('/clients', {
    // schema: CrmSchemas.listClients, // Temporariamente desabilitado para debug
    handler: CrmController.listClients,
  })

  fastify.get('/clients/grouped', {
    schema: CrmSchemas.listClientsGrouped,
    handler: CrmController.listClients,
  })

  fastify.get('/clients/:id', {
    schema: CrmSchemas.getClient,
    handler: CrmController.getClient,
  })

  fastify.put('/clients/:id', {
    schema: CrmSchemas.updateClient,
    handler: CrmController.updateClient,
  })

  fastify.delete('/clients/:id', {
    schema: CrmSchemas.deleteClient,
    handler: CrmController.deleteClient,
  })

  // Funcionalidades específicas de clientes
  fastify.patch('/clients/:id/stage', {
    schema: CrmSchemas.transitionStage,
    handler: CrmController.transitionStage,
  })

  fastify.get('/clients/search', {
    handler: CrmController.searchClients,
  })

  fastify.get('/clients/stats', {
    handler: CrmController.getStats,
  })

  // === ROTAS DE STAGES ===

  // CRUD básico de stages
  fastify.post('/stages', {
    schema: CrmSchemas.createStage,
    handler: CrmController.createStage,
  })

  fastify.get('/stages', {
    schema: CrmSchemas.listStages,
    handler: CrmController.listStages,
  })

  fastify.get('/stages/:id', {
    schema: CrmSchemas.getStage,
    handler: CrmController.getStage,
  })

  fastify.put('/stages/:id', {
    schema: CrmSchemas.updateStage,
    handler: CrmController.updateStage,
  })

  fastify.delete('/stages/:id', {
    schema: CrmSchemas.deleteStage,
    handler: CrmController.deleteStage,
  })

  // Funcionalidades específicas de stages
  fastify.patch('/stages/:id/reorder', {
    schema: CrmSchemas.reorderStage,
    handler: CrmController.reorderStage,
  })

  fastify.get('/stages/stats', {
    handler: CrmController.getStageStats,
  })
}
