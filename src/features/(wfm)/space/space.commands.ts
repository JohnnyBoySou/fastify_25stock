import { db } from '@/plugins/prisma'

export const SpaceCommands = {
  async create(data: {
    name: string
    description?: string
    capacity?: number
    location?: string
    storeId: string
    createdById: string
  }) {
    return await db.space.create({
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
        storeId: data.storeId,
        createdById: data.createdById,
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
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      capacity?: number
      location?: string
    }
  ) {
    return await db.space.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
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
      },
    })
  },

  async remove(id: string) {
    return await db.space.delete({
      where: { id },
    })
  },
}
