import { db } from '@/plugins/prisma'

export const SpaceQueries = {
  async getAll(storeId: string) {
    return await db.space.findMany({
      where: {
        storeId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async getById(id: string, storeId: string) {
    return await db.space.findFirst({
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
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
        { location: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    return await db.space.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
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
      take: query?.limit ? Number.parseInt(query.limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
}
