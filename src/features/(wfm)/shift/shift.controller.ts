import type { FastifyReply, FastifyRequest } from 'fastify'
import { ShiftCommands } from './shift.commands'
import { ShiftQueries } from './shift.queries'
import type {
  CreateShiftRequest,
  UpdateShiftRequest,
  AddParticipantRequest,
  UpdateParticipantRequest,
} from './shift.interfaces'
import { db } from '@/plugins/prisma'

export const ShiftController = {
  async create(request: CreateShiftRequest, reply: FastifyReply) {
    try {
      const { name, description, occurrenceId } = request.body

      if (occurrenceId) {
        
        const occurrenceExists = await db.scheduleOccurrence.findUnique({
          where: { id: occurrenceId },
          include: {
            schedule: {
              select: {
                id: true,
                storeId: true,
              },
            },
          },
        })
        
        console.log(occurrenceExists)

        if (!occurrenceExists) {
          return reply.status(404).send({
            error: 'Schedule occurrence not found',
          })
        }

        // Depois verificar se pertence à loja
        if (occurrenceExists.schedule.storeId !== request.store.id) {
          return reply.status(403).send({
            error: 'Schedule occurrence does not belong to this store',
          })
        }
      }

      const shift = await ShiftCommands.create({
        name,
        description,
        storeId: request.store.id,
        occurrenceId,
        createdById: request.user.id,
      })
      return reply.status(201).send(shift)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const query = request.query as {
        occurrenceId?: string
      }

      const filters = {
        occurrenceId: query?.occurrenceId,
      }

      const shifts = await ShiftQueries.getAll(request.store.id, filters)
      return reply.status(200).send(shifts)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const shift = await ShiftQueries.getById(id, request.store.id)

      if (!shift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      return reply.status(200).send(shift)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async update(request: UpdateShiftRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { name, description, occurrenceId } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o shift pertence à loja
      const existingShift = await ShiftQueries.getById(id, request.store.id)
      if (!existingShift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      // Validar occurrenceId se fornecido
      if (occurrenceId) {
       
        
        // Primeiro verificar se o occurrence existe
        const occurrenceExists = await db.scheduleOccurrence.findUnique({
          where: { id: occurrenceId },
          include: {
            schedule: {
              select: {
                id: true,
                storeId: true,
              },
            },
          },
        })

        if (!occurrenceExists) {
          return reply.status(404).send({
            error: 'Schedule occurrence not found',
          })
        }

        // Depois verificar se pertence à loja
        if (occurrenceExists.schedule.storeId !== request.store.id) {
          return reply.status(403).send({
            error: 'Schedule occurrence does not belong to this store',
          })
        }
      }

      const shift = await ShiftCommands.update(id, {
        name,
        description,
        occurrenceId,
      })
      return reply.status(200).send(shift)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o shift pertence à loja
      const existingShift = await ShiftQueries.getById(id, request.store.id)
      if (!existingShift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      const shift = await ShiftCommands.remove(id)
      return reply.status(200).send(shift)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getByQuery(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as {
        search?: string
        limit?: number
        occurrenceId?: string
      }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const shifts = await ShiftQueries.getByQuery(query, request.store.id)
      return reply.status(200).send(shifts)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async addParticipant(request: AddParticipantRequest, reply: FastifyReply) {
    try {
      const { shiftId } = request.params
      const { userId, role, note } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      if (!request.user?.id) {
        return reply.status(401).send({
          error: 'Authentication required',
        })
      }

      // Verificar se o shift pertence à loja
      const shift = await ShiftQueries.getById(shiftId, request.store.id)
      if (!shift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      // Verificar se o usuário já é participante
     
      const existingParticipant = await db.shiftParticipant.findFirst({
        where: {
          shiftId,
          userId,
        },
      })

      if (existingParticipant) {
        return reply.status(400).send({
          error: 'User is already a participant in this shift',
        })
      }

      const participant = await ShiftCommands.addParticipant({
        shiftId,
        userId,
        storeId: request.store.id,
        role,
        note,
        createdById: request.user.id,
      })
      return reply.status(201).send(participant)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async updateParticipant(request: UpdateParticipantRequest, reply: FastifyReply) {
    try {
      const { shiftId, participantId } = request.params
      const { role, status, note } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o shift pertence à loja
      const shift = await ShiftQueries.getById(shiftId, request.store.id)
      if (!shift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      // Verificar se o participante existe e pertence ao shift
     
      const participant = await db.shiftParticipant.findFirst({
        where: {
          id: participantId,
          shiftId,
          storeId: request.store.id,
        },
      })

      if (!participant) {
        return reply.status(404).send({
          error: 'Participant not found',
        })
      }

      const updatedParticipant = await ShiftCommands.updateParticipant(participantId, {
        role,
        status,
        note,
      })
      return reply.status(200).send(updatedParticipant)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async removeParticipant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { shiftId, participantId } = request.params as {
        shiftId: string
        participantId: string
      }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o shift pertence à loja
      const shift = await ShiftQueries.getById(shiftId, request.store.id)
      if (!shift) {
        return reply.status(404).send({
          error: 'Shift not found',
        })
      }

      // Verificar se o participante existe e pertence ao shift
      const participant = await db.shiftParticipant.findFirst({
        where: {
          id: participantId,
          shiftId,
          storeId: request.store.id,
        },
      })

      if (!participant) {
        return reply.status(404).send({
          error: 'Participant not found',
        })
      }

      const removedParticipant = await ShiftCommands.removeParticipant(participantId)
      return reply.status(200).send(removedParticipant)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
