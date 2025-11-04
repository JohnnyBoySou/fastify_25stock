import type { FastifyReply, FastifyRequest } from 'fastify'
import { ScheduleCommands } from './schedule.commands'
import { ScheduleQueries } from './schedule.queries'
import type { CreateScheduleRequest, UpdateScheduleRequest } from './schedule.interfaces'

export const ScheduleController = {
  async create(request: CreateScheduleRequest, reply: FastifyReply) {
    try {
      const { title, description, startTime, endTime, rrule, timezone, status, spaceId, userId } =
        request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      if (!request.user?.id) {
        return reply.status(401).send({
          error: 'Authentication required',
        })
      }

      // Validar se o space existe e pertence à loja
      const { db } = await import('@/plugins/prisma')
      const spaceExists = await db.space.findFirst({
        where: {
          id: spaceId,
          storeId: request.store.id,
        },
      })

      if (!spaceExists) {
        return reply.status(404).send({
          error: 'Space not found in this store',
        })
      }

      // Validar se startTime é anterior a endTime
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (start >= end) {
        return reply.status(400).send({
          error: 'Start time must be before end time',
        })
      }

      const schedule = await ScheduleCommands.create({
        title,
        description,
        startTime: start,
        endTime: end,
        rrule,
        timezone,
        status,
        storeId: request.store.id,
        spaceId,
        userId,
        createdById: request.user.id,
      })
      return reply.status(201).send(schedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const query = request.query as {
        spaceId?: string
        userId?: string
        status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
        startDate?: string
        endDate?: string
      }

      const filters = {
        spaceId: query?.spaceId,
        userId: query?.userId,
        status: query?.status,
        startDate: query?.startDate ? new Date(query.startDate) : undefined,
        endDate: query?.endDate ? new Date(query.endDate) : undefined,
      }

      const schedules = await ScheduleQueries.getAll(request.store.id, filters)
      return reply.status(200).send(schedules)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const schedule = await ScheduleQueries.getById(id, request.store.id)

      if (!schedule) {
        return reply.status(404).send({
          error: 'Schedule not found',
        })
      }

      return reply.status(200).send(schedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async update(request: UpdateScheduleRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { title, description, startTime, endTime, rrule, timezone, status, spaceId, userId } =
        request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o schedule pertence à loja
      const existingSchedule = await ScheduleQueries.getById(id, request.store.id)
      if (!existingSchedule) {
        return reply.status(404).send({
          error: 'Schedule not found',
        })
      }

      // Validar spaceId se fornecido
      if (spaceId) {
        const { db } = await import('@/plugins/prisma')
        const spaceExists = await db.space.findFirst({
          where: {
            id: spaceId,
            storeId: request.store.id,
          },
        })

        if (!spaceExists) {
          return reply.status(404).send({
            error: 'Space not found in this store',
          })
        }
      }

      // Validar horários se fornecidos
      let start: Date | undefined
      let end: Date | undefined

      if (startTime && endTime) {
        start = new Date(startTime)
        end = new Date(endTime)

        if (start >= end) {
          return reply.status(400).send({
            error: 'Start time must be before end time',
          })
        }
      } else if (startTime || endTime) {
        // Se apenas um dos horários foi fornecido, usar o existente
        start = startTime ? new Date(startTime) : existingSchedule.startTime
        end = endTime ? new Date(endTime) : existingSchedule.endTime

        if (start >= end) {
          return reply.status(400).send({
            error: 'Start time must be before end time',
          })
        }
      }

      const schedule = await ScheduleCommands.update(id, {
        title,
        description,
        startTime: start,
        endTime: end,
        rrule,
        timezone,
        status,
        spaceId,
        userId,
      })
      return reply.status(200).send(schedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o schedule pertence à loja
      const existingSchedule = await ScheduleQueries.getById(id, request.store.id)
      if (!existingSchedule) {
        return reply.status(404).send({
          error: 'Schedule not found',
        })
      }

      const schedule = await ScheduleCommands.remove(id)
      return reply.status(200).send(schedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getByQuery(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as {
        search?: string
        limit?: number
        spaceId?: string
        userId?: string
        status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
        startDate?: string
        endDate?: string
      }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const schedules = await ScheduleQueries.getByQuery(query, request.store.id)
      return reply.status(200).send(schedules)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
