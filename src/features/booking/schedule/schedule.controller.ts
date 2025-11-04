import type { FastifyReply, FastifyRequest } from 'fastify'
import { ScheduleCommands } from './schedule.commands'
import { ScheduleQueries } from './schedule.queries'
import type { CreateScheduleRequest, UpdateScheduleRequest } from './schedule.interfaces'
import { checkScheduleConflicts, processScheduleTimes } from './schedule.utils'

export const ScheduleController = {
  async create(request: CreateScheduleRequest, reply: FastifyReply) {
    try {

      const { title, description, date, startTime, endTime, rrule, timezone, status, spaceId } =
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

      // Processar horários baseado na presença de rrule
      let start: Date
      let end: Date

      try {
        const times = processScheduleTimes(date, startTime, endTime, rrule)
        start = times.start
        end = times.end
      } catch (error: any) {
        return reply.status(400).send({
          error: error.message || 'Invalid date/time format',
        })
      }

      // Verificar conflitos com agendamentos existentes
      const conflictCheck = await checkScheduleConflicts(
        spaceId,
        start,
        end,
        rrule,
        timezone
      )

      if (conflictCheck.hasConflict) {
        return reply.status(409).send({
          error: 'Schedule conflict detected',
          message: 'This schedule conflicts with existing schedules',
          conflicts: conflictCheck.conflictingSchedules,
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
        userId: request.user.id,  
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
        page?: number
        limit?: number
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
      const { title, description, date, startTime, endTime, rrule, timezone, status, spaceId } =
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
      const finalSpaceId = spaceId || existingSchedule.spaceId
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

      // Processar horários - sempre usar date + startTime/endTime (HH:mm)
      const finalRrule = rrule !== undefined ? rrule : existingSchedule.rrule || undefined
      let start: Date | undefined
      let end: Date | undefined

      // Se algum campo de tempo foi fornecido, processar
      if (date || startTime || endTime || rrule !== undefined) {
        // Determinar valores finais para processamento
        let finalDate: string
        let finalStartTime: string
        let finalEndTime: string

        // Extrair data do existente se não fornecida
        if (date) {
          finalDate = date
        } else {
          // Extrair data do agendamento existente
          const existingDate = existingSchedule.startTime.toISOString().split('T')[0]
          finalDate = existingDate
        }

        // Extrair horários do existente se não fornecidos
        if (startTime && endTime) {
          finalStartTime = startTime
          finalEndTime = endTime
        } else {
          // Usar horários do existente no formato HH:mm (UTC)
          const existingStartDate = new Date(existingSchedule.startTime)
          const existingEndDate = new Date(existingSchedule.endTime)
          const existingStartTime = `${String(existingStartDate.getUTCHours()).padStart(2, '0')}:${String(existingStartDate.getUTCMinutes()).padStart(2, '0')}`
          const existingEndTime = `${String(existingEndDate.getUTCHours()).padStart(2, '0')}:${String(existingEndDate.getUTCMinutes()).padStart(2, '0')}`
          finalStartTime = startTime || existingStartTime
          finalEndTime = endTime || existingEndTime
        }

        try {
          const times = processScheduleTimes(finalDate, finalStartTime, finalEndTime, finalRrule)
          start = times.start
          end = times.end
        } catch (error: any) {
          return reply.status(400).send({
            error: error.message || 'Invalid date/time format',
          })
        }
      } else {
        // Se nenhum campo foi fornecido, usar valores existentes
        start = existingSchedule.startTime
        end = existingSchedule.endTime
      }

      // Verificar conflitos (excluindo o próprio agendamento)
      const finalTimezone = timezone !== undefined ? timezone : existingSchedule.timezone || undefined
      const conflictCheck = await checkScheduleConflicts(
        finalSpaceId,
        start,
        end,
        finalRrule,
        finalTimezone,
        id // Excluir o próprio agendamento
      )

      if (conflictCheck.hasConflict) {
        return reply.status(409).send({
          error: 'Schedule conflict detected',
          message: 'This schedule conflicts with existing schedules',
          conflicts: conflictCheck.conflictingSchedules,
        })
      }

      // Se rrule foi alterado, precisamos recriar as ocorrências
      if (rrule !== undefined && rrule !== existingSchedule.rrule) {
        const { db } = await import('@/plugins/prisma')
        const { generateOccurrences, createScheduleOccurrences } = await import('./schedule.utils')
        
        // Deletar ocorrências antigas
        await db.scheduleOccurrence.deleteMany({
          where: { scheduleId: id },
        })

        // Gerar novas ocorrências
        const occurrences = await generateOccurrences(
          id,
          start,
          end,
          rrule || undefined,
          finalTimezone
        )
        await createScheduleOccurrences(
          id,
          occurrences,
          status || existingSchedule.status
        )
      }

      const schedule = await ScheduleCommands.update(id, {
        title,
        description,
        startTime: start,
        endTime: end,
        rrule: finalRrule,
        timezone: finalTimezone,
        status,
        spaceId,
        userId: request.user.id,
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
