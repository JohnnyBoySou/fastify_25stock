import { db } from '@/plugins/prisma'

export const ScheduleQueries = {
  async getAll(
    storeId: string,
    filters?: {
      spaceId?: string
      userId?: string
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
      startDate?: Date
      endDate?: Date
      page?: number
      limit?: number
    }
  ) {
    const where: any = {
      storeId,
    }

    if (filters?.spaceId) {
      where.spaceId = filters.spaceId
    }

    if (filters?.userId) {
      where.userId = filters.userId
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      if (filters.startDate) {
        where.startTime = { gte: filters.startDate }
      }
      if (filters.endDate) {
        where.endTime = { lte: filters.endDate }
      }
    }

    const schedules = await db.schedule.findMany({
      where,
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
      orderBy: {
        startTime: 'asc',
      },
    })

    const total = await db.schedule.count({ where })

    return {
      items: schedules,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit ? Number.parseInt(filters.limit.toString()) : 10,
        total,
        totalPages: Math.ceil(
          total / (filters?.limit ? Number.parseInt(filters.limit.toString()) : 10)
        ),
      },
    }
  },

  async getById(id: string, storeId: string) {
    return await db.schedule.findFirst({
      where: {
        id,
        storeId,
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
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })
  },

  async getByQuery(query: any, storeId: string) {
    const where: any = {
      storeId,
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.spaceId) {
      where.spaceId = query.spaceId
    }

    if (query?.userId) {
      where.userId = query.userId
    }

    if (query?.status) {
      where.status = query.status
    }

    if (query?.startDate || query?.endDate) {
      if (query.startDate) {
        where.startTime = { gte: new Date(query.startDate) }
      }
      if (query.endDate) {
        where.endTime = { lte: new Date(query.endDate) }
      }
    }

    const schedules = await db.schedule.findMany({
      where,
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
      take: query?.limit ? Number.parseInt(query.limit.toString()) : undefined,
      skip: query?.page ? (query.page - 1) * Number.parseInt(query.limit.toString()) : undefined,
      orderBy: {
        startTime: 'asc',
      },
    })
    const total = await db.schedule.count({ where })

    return {
      items: schedules,
      pagination: {
        page: query?.page || 1,
        limit: query?.limit ? Number.parseInt(query.limit.toString()) : 10,
        total,
        totalPages: Math.ceil(
          total / (query?.limit ? Number.parseInt(query.limit.toString()) : 10)
        ),
      },
    }
  },
}
