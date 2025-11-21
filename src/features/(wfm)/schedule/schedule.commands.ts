import { db } from '@/plugins/prisma'
import { generateOccurrences, createScheduleOccurrences } from './schedule.utils'

export const ScheduleCommands = {
  async create(data: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    rrule?: string
    timezone?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    storeId: string
    spaceId: string
    userId: string
    createdById: string
  }) {
    // Criar o agendamento
    const schedule = await db.schedule.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        rrule: data.rrule,
        timezone: data.timezone,
        status: data.status || 'PENDING',
        storeId: data.storeId,
        spaceId: data.spaceId,
        userId: data.userId,
        createdById: data.createdById,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        occurrences: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    })

    // Gerar e criar ocorrências se houver rrule
    if (data.rrule) {
      const occurrences = await generateOccurrences(
        schedule.id,
        data.startTime,
        data.endTime,
        data.rrule,
        data.timezone
      )
      await createScheduleOccurrences(schedule.id, occurrences, data.status || 'PENDING')
    } else {
      // Se não há rrule, criar uma ocorrência única
      await createScheduleOccurrences(
        schedule.id,
        [{ startTime: data.startTime, endTime: data.endTime }],
        data.status || 'PENDING'
      )
    }

    // Retornar o agendamento com as ocorrências atualizadas
    return await db.schedule.findUnique({
      where: { id: schedule.id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        occurrences: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      title?: string
      description?: string
      startTime?: Date
      endTime?: Date
      rrule?: string
      timezone?: string
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
      spaceId?: string
      userId?: string
    }
  ) {
    return await db.schedule.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        rrule: data.rrule,
        timezone: data.timezone,
        status: data.status,
        spaceId: data.spaceId,
        userId: data.userId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        occurrences: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    })
  },

  async remove(id: string) {
    return await db.schedule.delete({
      where: { id },
    })
  },

  async approve(id: string, approvedById: string) {
    // Atualizar o status do schedule e todas as ocorrências para CONFIRMED
    const schedule = await db.schedule.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            requiresApproval: true,
            approvalUserId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        occurrences: true,
      },
    })

    // Atualizar todas as ocorrências para CONFIRMED
    await db.scheduleOccurrence.updateMany({
      where: { scheduleId: id },
      data: { status: 'CONFIRMED' },
    })

    return schedule
  },

  async reject(id: string, rejectedById: string, reason?: string) {
    // Atualizar o status do schedule e todas as ocorrências para CANCELLED
    const schedule = await db.schedule.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            requiresApproval: true,
            approvalUserId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        occurrences: true,
      },
    })

    // Atualizar todas as ocorrências para CANCELLED
    await db.scheduleOccurrence.updateMany({
      where: { scheduleId: id },
      data: { status: 'CANCELLED' },
    })

    return schedule
  },
}
