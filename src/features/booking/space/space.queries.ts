import { db } from '@/plugins/prisma'

export const SpaceQueries = {
  async getAll({ page, limit }: { page?: number, limit?: number }, storeId: string) {
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
      take: limit ? Number.parseInt(limit.toString()) : undefined,
      skip: page ? (page - 1) * limit : undefined,
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

  async getByQuery({ page, limit, search }: { page?: number, limit?: number, search?: string }, storeId: string) {
    const where: any = {
      storeId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
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
      take: limit ? Number.parseInt(limit.toString()) : undefined,
      skip: page ? (page - 1) * limit : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },
}
