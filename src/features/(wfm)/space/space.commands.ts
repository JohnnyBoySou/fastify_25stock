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
      mediaId?: string
    }
  ) {
    // Preparar dados de atualização do space (sem mediaId)
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.capacity !== undefined) updateData.capacity = data.capacity
    if (data.location !== undefined) updateData.location = data.location

    return await db.space.update({
      where: { id },

      
      data: updateData,
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
