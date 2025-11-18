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
        resources: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isAvailable: true,
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

    // Transformar spaceMedia em media
    const spacesWithMedia = spaces.map((space) => {
      const { spaceMedia, ...rest } = space as any
      return {
        ...rest,
        media: spaceMedia?.map((sm: any) => sm.media) || [],
      }
    })

    return {
      items: spacesWithMedia,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getById(id: string, storeId: string) {
    const space = await db.space.findFirst({
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
        resources: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            isAvailable: true,
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

    if (!space) {
      return null
    }

    // Transformar spaceMedia em media
    const { spaceMedia, ...rest } = space as any
    return {
      ...rest,
      media: spaceMedia?.map((sm: any) => sm.media) || [],
    }
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

    // Transformar spaceMedia em media
    const spacesWithMedia = spaces.map((space) => {
      const { spaceMedia, ...rest } = space as any
      return {
        ...rest,
        media: spaceMedia?.map((sm: any) => sm.media) || [],
      }
    })

    return {
      items: spacesWithMedia,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },
}
