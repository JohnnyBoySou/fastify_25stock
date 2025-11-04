import { db } from '@/plugins/prisma'

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
    return await db.schedule.create({
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
}
