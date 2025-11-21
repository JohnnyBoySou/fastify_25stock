import { db } from '@/plugins/prisma'

export const SpaceCommands = {
  async create(data: {
    name: string
    description?: string
    capacity?: number
    location?: string
    minStartTime?: string
    minEndTime?: string
    minBookingDuration?: number
    gapTime?: number
    requiresApproval?: boolean
    approvalUserId?: string
    allowOverlapping?: boolean
    maxSimultaneousBookings?: number
    resources?: string[]
    storeId: string
    createdById: string
  }) {
    return await db.space.create({
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
        minStartTime: data.minStartTime,
        minEndTime: data.minEndTime,
        minBookingDuration: data.minBookingDuration,
        gapTime: data.gapTime,
        requiresApproval: data.requiresApproval,
        approvalUserId: data.approvalUserId,
        allowOverlapping: data.allowOverlapping,
        maxSimultaneousBookings: data.maxSimultaneousBookings,
        storeId: data.storeId,
        createdById: data.createdById,
        resources: data.resources
          ? {
              connect: data.resources.map((resourceId) => ({ id: resourceId })),
            }
          : undefined,
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
        resources: true,
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
      minStartTime?: string
      minEndTime?: string
      minBookingDuration?: number
      gapTime?: number
      requiresApproval?: boolean
      approvalUserId?: string
      allowOverlapping?: boolean
      maxSimultaneousBookings?: number
      resources?: string[]
      mediaId?: string
    }
  ) {
    // Preparar dados de atualização do space (sem mediaId)
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.capacity !== undefined) updateData.capacity = data.capacity
    if (data.location !== undefined) updateData.location = data.location
    if (data.minStartTime !== undefined) updateData.minStartTime = data.minStartTime
    if (data.minEndTime !== undefined) updateData.minEndTime = data.minEndTime
    if (data.minBookingDuration !== undefined) updateData.minBookingDuration = data.minBookingDuration
    if (data.gapTime !== undefined) updateData.gapTime = data.gapTime
    if (data.requiresApproval !== undefined) updateData.requiresApproval = data.requiresApproval
    if (data.approvalUserId !== undefined) updateData.approvalUserId = data.approvalUserId
    if (data.allowOverlapping !== undefined) updateData.allowOverlapping = data.allowOverlapping
    if (data.maxSimultaneousBookings !== undefined) updateData.maxSimultaneousBookings = data.maxSimultaneousBookings

    // Atualizar recursos se fornecido
    if (data.resources !== undefined) {
      updateData.resources = {
        set: data.resources.map((resourceId) => ({ id: resourceId })),
      }
    }

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
        resources: true,
      },
    })
  },

  async remove(id: string) {
    return await db.space.delete({
      where: { id },
    })
  },
}
