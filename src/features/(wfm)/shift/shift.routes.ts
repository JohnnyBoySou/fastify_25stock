import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ShiftController } from './shift.controller'
import { ShiftSchemas } from './shift.schemas'

export async function ShiftRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // Rotas de Shift
  fastify.post('/', {
    preHandler: [Middlewares.permission('SHIFTS', 'CREATE')],
    schema: ShiftSchemas.create,
    handler: ShiftController.create,
  })

  fastify.get('/', {
    preHandler: [Middlewares.permission('SHIFTS', 'READ')],
    schema: ShiftSchemas.getAll,
    handler: ShiftController.getAll,
  })

  fastify.get('/:id', {
    preHandler: [Middlewares.permission('SHIFTS', 'READ')],
    schema: ShiftSchemas.getById,
    handler: ShiftController.getById,
  })

  fastify.put('/:id', {
    preHandler: [Middlewares.permission('SHIFTS', 'UPDATE')],
    schema: ShiftSchemas.update,
    handler: ShiftController.update,
  })

  fastify.delete('/:id', {
    preHandler: [Middlewares.permission('SHIFTS', 'DELETE')],
    schema: ShiftSchemas.remove,
    handler: ShiftController.remove,
  })

  fastify.get('/search', {
    preHandler: [Middlewares.permission('SHIFTS', 'READ')],
    schema: ShiftSchemas.getByQuery,
    handler: ShiftController.getByQuery,
  })

  // Rotas de Participantes

  fastify.get('/:shiftId/participants', {
    preHandler: [Middlewares.permission('SHIFTS', 'READ')],
    schema: ShiftSchemas.getParticipants,
    handler: ShiftController.getParticipants,
  })

  fastify.post('/:shiftId/participants', {
    preHandler: [Middlewares.permission('SHIFTS', 'CREATE')],
    schema: ShiftSchemas.addParticipant,
    handler: ShiftController.addParticipant,
  })

  fastify.put('/:shiftId/participants/:participantId', {
    preHandler: [Middlewares.permission('SHIFTS', 'UPDATE')],
    schema: ShiftSchemas.updateParticipant,
    handler: ShiftController.updateParticipant,
  })

  fastify.delete('/:shiftId/participants/:participantId', {
    preHandler: [Middlewares.permission('SHIFTS', 'DELETE')],
    schema: ShiftSchemas.removeParticipant,
    handler: ShiftController.removeParticipant,
  })
}
