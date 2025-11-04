import { db } from '@/plugins/prisma'

export const ShiftQueries = {
  async getAll(
    storeId: string,
    filters?: {
      occurrenceId?: string
    }
  ) {
    const where: any = {
      storeId,
    }

    if (filters?.occurrenceId) {
      where.occurrenceId = filters.occurrenceId
    }

    return await db.shift.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        occurrence: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async getById(id: string, storeId: string) {
    return await db.shift.findFirst({
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
        occurrence: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
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
          },
          orderBy: {
            createdAt: 'desc',
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
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.occurrenceId) {
      where.occurrenceId = query.occurrenceId
    }

    return await db.shift.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        occurrence: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      take: query?.limit ? Number.parseInt(query.limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
}
