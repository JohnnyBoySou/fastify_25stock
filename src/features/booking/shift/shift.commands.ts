import { db } from '@/plugins/prisma'

export const ShiftCommands = {
  async create(data: {
    name: string
    description?: string
    storeId: string
    occurrenceId?: string
    createdById: string
  }) {
    return await db.shift.create({
      data: {
        name: data.name,
        description: data.description,
        storeId: data.storeId,
        occurrenceId: data.occurrenceId,
        createdById: data.createdById,
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
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      occurrenceId?: string
    }
  ) {
    return await db.shift.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        occurrenceId: data.occurrenceId,
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
        },
      },
    })
  },

  async remove(id: string) {
    return await db.shift.delete({
      where: { id },
    })
  },

  async addParticipant(data: {
    shiftId: string
    userId: string
    storeId: string
    role?: string
    note?: string
    createdById: string
  }) {
    return await db.shiftParticipant.create({
      data: {
        shiftId: data.shiftId,
        userId: data.userId,
        storeId: data.storeId,
        role: data.role,
        note: data.note,
        createdById: data.createdById,
        status: 'PENDING',
      },
      include: {
        shift: {
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
      },
    })
  },

  async updateParticipant(
    participantId: string,
    data: {
      role?: string
      status?: 'PENDING' | 'CONFIRMED' | 'DECLINED'
      note?: string
    }
  ) {
    const updateData: any = {}

    if (data.role !== undefined) {
      updateData.role = data.role
    }

    if (data.note !== undefined) {
      updateData.note = data.note
    }

    if (data.status !== undefined) {
      updateData.status = data.status

      // Atualizar timestamps quando status mudar
      if (data.status === 'CONFIRMED') {
        updateData.confirmedAt = new Date()
        updateData.deniedAt = null
      } else if (data.status === 'DECLINED') {
        updateData.deniedAt = new Date()
        updateData.confirmedAt = null
      } else if (data.status === 'PENDING') {
        updateData.confirmedAt = null
        updateData.deniedAt = null
      }
    }

    return await db.shiftParticipant.update({
      where: { id: participantId },
      data: updateData,
      include: {
        shift: {
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
      },
    })
  },

  async removeParticipant(participantId: string) {
    return await db.shiftParticipant.delete({
      where: { id: participantId },
    })
  },
}
