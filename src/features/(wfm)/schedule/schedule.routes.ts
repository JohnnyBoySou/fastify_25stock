import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ScheduleController } from './schedule.controller'
import { ScheduleSchemas } from './schedule.schemas'

export async function ScheduleRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.post('/', {
    preHandler: [Middlewares.permission('SCHEDULES', 'CREATE')],
    schema: ScheduleSchemas.create,
    handler: ScheduleController.create,
  })

  fastify.get('/', {
    preHandler: [Middlewares.permission('SCHEDULES', 'READ')],
    schema: ScheduleSchemas.getAll,
    handler: ScheduleController.getAll,
  })

  fastify.get('/:id', {
    preHandler: [Middlewares.permission('SCHEDULES', 'READ')],
    schema: ScheduleSchemas.getById,
    handler: ScheduleController.getById,
  })

  fastify.put('/:id', {
    preHandler: [Middlewares.permission('SCHEDULES', 'UPDATE')],
    schema: ScheduleSchemas.update,
    handler: ScheduleController.update,
  })

  fastify.delete('/:id', {
    preHandler: [Middlewares.permission('SCHEDULES', 'DELETE')],
    schema: ScheduleSchemas.remove,
    handler: ScheduleController.remove,
  })

  fastify.get('/search', {
    preHandler: [Middlewares.permission('SCHEDULES', 'READ')],
    schema: ScheduleSchemas.getByQuery,
    handler: ScheduleController.getByQuery,
  })

  fastify.post('/:id/approve', {
    preHandler: [Middlewares.permission('SCHEDULES', 'APPROVE')],
    schema: ScheduleSchemas.approve,
    handler: ScheduleController.approve,
  })

  fastify.post('/:id/reject', {
    preHandler: [Middlewares.permission('SCHEDULES', 'APPROVE')],
    schema: ScheduleSchemas.reject,
    handler: ScheduleController.reject,
  })

  fastify.get('/approvals', {
    preHandler: [Middlewares.permission('SCHEDULES', 'APPROVE')],
    schema: ScheduleSchemas.getPendingApprovals,
    handler: ScheduleController.getPendingApprovals,
  })
}
