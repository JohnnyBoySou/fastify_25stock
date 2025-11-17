import { db } from '@/plugins/prisma'

export const SpaceQueries = {
  async getAll({ page, limit }: { page?: number, limit?: number }, storeId: string) {
    const spaces = await db.space.findMany({
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
        spaceMedia: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                name: true,
                type: true,
                size: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? Number.parseInt(limit.toString()) : undefined,
      skip: page ? (page - 1) * limit : undefined,
    })

    const total = await db.space.count({ where: { storeId } })

    return {
      items: spaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
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
        spaceMedia: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                name: true,
                type: true,
                size: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
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

    const spaces = await db.space.findMany({
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
        spaceMedia: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                name: true,
                type: true,
                size: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
      },
      take: limit ? Number.parseInt(limit.toString()) : undefined,
      skip: page ? (page - 1) * limit : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const total = await db.space.count({ where })

    return {
      items: spaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },
}
