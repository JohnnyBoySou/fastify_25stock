import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { MilestoneController } from './milestone.controller'
import { MilestoneSchemas } from './milestone.schema'
import { RoadmapController } from './roadmap.controller'
import { RoadmapSchemas } from './roadmap.schema'

export async function RoadmapRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // === ROADMAP ROUTES ===
  // Rotas específicas ANTES das rotas dinâmicas
  fastify.get('/active', {
    handler: RoadmapController.getActive,
  })

  fastify.get('/stats', {
    handler: RoadmapController.getStats,
  })

  fastify.get('/search', {
    handler: RoadmapController.search,
  })

  // CRUD básico
  fastify.post('/', {
    schema: RoadmapSchemas.create,

    handler: RoadmapController.create,
  })

  fastify.get('/', {
    schema: RoadmapSchemas.list,

    handler: RoadmapController.list,
  })

  fastify.get('/:id', {
    schema: RoadmapSchemas.get,

    handler: RoadmapController.get,
  })

  fastify.put('/:id', {
    schema: RoadmapSchemas.update,

    handler: RoadmapController.update,
  })

  fastify.delete('/:id', {
    schema: RoadmapSchemas.delete,

    handler: RoadmapController.delete,
  })

  // Ações específicas em IDs
  fastify.patch('/:id/status', {
    handler: RoadmapController.updateStatus,
  })

  // === MILESTONE ROUTES (nested) ===
  // Rotas de milestone específicas ANTES das rotas dinâmicas
  fastify.get('/:roadmapId/milestones/stats', {
    handler: MilestoneController.getStats,
  })

  fastify.get('/:roadmapId/milestones/upcoming', {
    handler: MilestoneController.getUpcoming,
  })

  fastify.get('/:roadmapId/milestones/overdue', {
    handler: MilestoneController.getOverdue,
  })

  fastify.get('/:roadmapId/milestones/in-progress', {
    handler: MilestoneController.getInProgress,
  })

  fastify.get('/:roadmapId/milestones/timeline', {
    handler: MilestoneController.getTimeline,
  })

  fastify.get('/:roadmapId/milestones/search', {
    handler: MilestoneController.search,
  })

  // CRUD básico de milestones
  fastify.post('/:roadmapId/milestones', {
    schema: MilestoneSchemas.create,

    handler: MilestoneController.create,
  })

  fastify.get('/:roadmapId/milestones', {
    schema: MilestoneSchemas.list,

    handler: MilestoneController.list,
  })

  fastify.get('/:roadmapId/milestones/:id', {
    schema: MilestoneSchemas.get,

    handler: MilestoneController.get,
  })

  fastify.put('/:roadmapId/milestones/:id', {
    schema: MilestoneSchemas.update,

    handler: MilestoneController.update,
  })

  fastify.delete('/:roadmapId/milestones/:id', {
    schema: MilestoneSchemas.delete,

    handler: MilestoneController.delete,
  })

  // Ações específicas em milestones
  fastify.patch('/:roadmapId/milestones/:id/progress', {
    schema: MilestoneSchemas.updateProgress,

    handler: MilestoneController.updateProgress,
  })

  fastify.patch('/:roadmapId/milestones/:id/status', {
    schema: MilestoneSchemas.updateStatus,

    handler: MilestoneController.updateStatus,
  })

  fastify.post('/:roadmapId/milestones/reorder', {
    schema: MilestoneSchemas.reorder,

    handler: MilestoneController.reorder,
  })
}
