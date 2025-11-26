import type { FastifyReply, FastifyRequest } from 'fastify'
import { ScheduleCommands } from './schedule.commands'
import { ScheduleQueries } from './schedule.queries'
import type {
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ApproveScheduleRequest,
  RejectScheduleRequest,
} from './schedule.interfaces'
import {
  checkScheduleConflicts,
  processScheduleTimes,
  validateSpaceTimeRange,
} from './schedule.utils'
import { db } from '@/plugins/prisma'
import { EmailService } from '@/services/email/email.service'

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

      // Validar se o horário está dentro do range permitido do Space
      const timeRangeValidation = await validateSpaceTimeRange(spaceId, start, end, rrule)
      if (!timeRangeValidation.isValid) {
        return reply.status(400).send({
          error: timeRangeValidation.error || 'Horário fora do range permitido do espaço',
        })
      }

      const conflictCheck = await checkScheduleConflicts(spaceId, start, end, rrule, timezone)

      if (conflictCheck.hasConflict) {
        return reply.status(409).send({
          error: 'Schedule conflict detected',
          message: 'This schedule conflicts with existing schedules',
          conflicts: conflictCheck.conflictingSchedules,
        })
      }

      // Verificar se o space requer aprovação
      const space = await db.space.findFirst({
        where: {
          id: spaceId,
          storeId: request.store.id,
        },
        include: {
          approvalUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!space) {
        return reply.status(404).send({
          error: 'Space not found in this store',
        })
      }

      // Se o space requer aprovação, o status deve ser PENDING
      const finalStatus = space.requiresApproval ? 'PENDING' : status || 'PENDING'

      const schedule = await ScheduleCommands.create({
        title,
        description,
        startTime: start,
        endTime: end,
        rrule,
        timezone,
        status: finalStatus,
        storeId: request.store.id,
        spaceId,
        userId: request.user.id,
        createdById: request.user.id,
      })

      // Se o space requer aprovação e tem um approvalUser, enviar email de solicitação de aprovação
      if (space.requiresApproval && space.approvalUser?.email) {
        try {
          const approvalUrl = `${process.env.FRONTEND_URL || 'https://app.25stock.com'}/schedules/approvals`
          const startTimeFormatted = new Date(schedule.startTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
          const endTimeFormatted = new Date(schedule.endTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })

          await EmailService.sendScheduleApprovalRequestEmail({
            email: space.approvalUser.email as string,
            name: space.approvalUser.name as string,
            scheduleTitle: schedule.title,
            scheduleDescription: schedule.description || undefined,
            spaceName: space.name,
            requesterName: schedule.user?.name || schedule.createdBy?.name || 'Usuário',
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            approvalUrl,
          })
        } catch (emailError: any) {
          request.log.warn({ err: emailError }, 'Erro ao enviar email de solicitação de aprovação')
          // Não falha a criação do schedule se houver erro ao enviar o email
        }
      }

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

      // Garantir que start e end estão definidos
      if (!start || !end) {
        return reply.status(400).send({
          error: 'Start time and end time are required',
        })
      }

      // Validar se o horário está dentro do range permitido do Space
      const timeRangeValidation = await validateSpaceTimeRange(finalSpaceId, start, end, finalRrule)
      if (!timeRangeValidation.isValid) {
        return reply.status(400).send({
          error: timeRangeValidation.error || 'Horário fora do range permitido do espaço',
        })
      }

      // Verificar conflitos (excluindo o próprio agendamento)
      const finalTimezone =
        timezone !== undefined ? timezone : existingSchedule.timezone || undefined
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
        await createScheduleOccurrences(id, occurrences, status || existingSchedule.status)
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

  async approve(request: ApproveScheduleRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

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

      // Verificar se o schedule pertence à loja
      const existingSchedule = await ScheduleQueries.getById(id, request.store.id)
      if (!existingSchedule) {
        return reply.status(404).send({
          error: 'Schedule not found',
        })
      }

      // Verificar se o schedule está pendente
      if (existingSchedule.status !== 'PENDING') {
        return reply.status(400).send({
          error: 'Schedule is not pending approval',
        })
      }

      // Verificar se o usuário tem permissão para aprovar (deve ser o approvalUser do space)
      const space = await db.space.findFirst({
        where: {
          id: existingSchedule.spaceId,
          storeId: request.store.id,
        },
        include: {
          approvalUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!space) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      if (
        space.requiresApproval &&
        space.approvalUserId &&
        space.approvalUserId !== request.user.id
      ) {
        return reply.status(403).send({
          error: 'You do not have permission to approve this schedule',
        })
      }

      // Aprovar o schedule
      const approvedSchedule = await ScheduleCommands.approve(id, request.user.id)

      // Enviar email de notificação para o usuário que criou o agendamento
      if (approvedSchedule.user?.email) {
        try {
          const scheduleUrl = `${process.env.FRONTEND_URL || 'https://app.25stock.com'}/schedules/${id}`
          const startTimeFormatted = new Date(approvedSchedule.startTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
          const endTimeFormatted = new Date(approvedSchedule.endTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })

          await EmailService.sendScheduleApprovedEmail({
            email: approvedSchedule.user.email as string,
            name: approvedSchedule.user.name as string,
            scheduleTitle: approvedSchedule.title,
            spaceName: approvedSchedule.space?.name || 'Espaço',
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            scheduleUrl,
          })
        } catch (emailError: any) {
          request.log.warn({ err: emailError }, 'Erro ao enviar email de aprovação')
        }
      }

      return reply.status(200).send(approvedSchedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async reject(request: RejectScheduleRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { reason } = request.body

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

      // Verificar se o schedule pertence à loja
      const existingSchedule = await ScheduleQueries.getById(id, request.store.id)
      if (!existingSchedule) {
        return reply.status(404).send({
          error: 'Schedule not found',
        })
      }

      // Verificar se o schedule está pendente
      if (existingSchedule.status !== 'PENDING') {
        return reply.status(400).send({
          error: 'Schedule is not pending approval',
        })
      }

      // Verificar se o usuário tem permissão para rejeitar (deve ser o approvalUser do space)
      const space = await db.space.findFirst({
        where: {
          id: existingSchedule.spaceId,
          storeId: request.store.id,
        },
        include: {
          approvalUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!space) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      if (
        space.requiresApproval &&
        space.approvalUserId &&
        space.approvalUserId !== request.user.id
      ) {
        return reply.status(403).send({
          error: 'You do not have permission to reject this schedule',
        })
      }

      // Rejeitar o schedule
      const rejectedSchedule = await ScheduleCommands.reject(id, request.user.id, reason)

      // Enviar email de notificação para o usuário que criou o agendamento
      if (rejectedSchedule.user?.email) {
        try {
          const scheduleUrl = `${process.env.FRONTEND_URL || 'https://app.25stock.com'}/schedules/${id}`
          const startTimeFormatted = new Date(rejectedSchedule.startTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
          const endTimeFormatted = new Date(rejectedSchedule.endTime).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })

          await EmailService.sendScheduleRejectedEmail({
            email: rejectedSchedule.user.email as string,
            name: rejectedSchedule.user.name as string,
            scheduleTitle: rejectedSchedule.title,
            spaceName: rejectedSchedule.space?.name || 'Espaço',
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            reason: reason || undefined,
            scheduleUrl,
          })
        } catch (emailError: any) {
          request.log.warn({ err: emailError }, 'Erro ao enviar email de rejeição')
        }
      }

      return reply.status(200).send(rejectedSchedule)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getPendingApprovals(request: FastifyRequest, reply: FastifyReply) {
    try {
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

      const query = request.query as {
        page?: number
        limit?: number
      }

      // Buscar agendamentos pendentes onde o usuário atual é o approvalUser do space
      const pendingSchedules = await ScheduleQueries.getPendingApprovals(
        request.store.id,
        request.user.id,
        {
          page: query?.page,
          limit: query?.limit,
        }
      )

      return reply.status(200).send(pendingSchedules)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
