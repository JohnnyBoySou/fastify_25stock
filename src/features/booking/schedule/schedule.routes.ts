import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ScheduleController } from './schedule.controller'
import { ScheduleSchemas } from './schedule.schemas'

export async function ScheduleRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.post('/', {
    schema: ScheduleSchemas.create,
    handler: ScheduleController.create,
  })

  fastify.get('/', {
    schema: ScheduleSchemas.getAll,
    handler: ScheduleController.getAll,
  })

  fastify.get('/:id', {
    schema: ScheduleSchemas.getById,
    handler: ScheduleController.getById,
  })

  fastify.put('/:id', {
    schema: ScheduleSchemas.update,
    handler: ScheduleController.update,
  })

  fastify.delete('/:id', {
    schema: ScheduleSchemas.remove,
    handler: ScheduleController.remove,
  })

  fastify.get('/search', {
    schema: ScheduleSchemas.getByQuery,
    handler: ScheduleController.getByQuery,
  })
}
