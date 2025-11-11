import type { FastifyReply, FastifyRequest } from 'fastify'
import { MilestoneCommands } from './commands/milestone.commands'
import type {
  CreateMilestoneRequest,
  DeleteMilestoneRequest,
  GetMilestoneRequest,
  ListMilestonesRequest,
  UpdateMilestoneProgressRequest,
  UpdateMilestoneRequest,
  UpdateMilestoneStatusRequest,
} from './milestone.interfaces'
import { MilestoneQueries } from './queries/milestone.queries'

export const MilestoneController = {
  // === CRUD BÁSICO ===
  async create(request: CreateMilestoneRequest, reply: FastifyReply) {
    try {
      const { roadmapId } = request.params
      const { title, description, status, progress, order, startDate, endDate } = request.body

      const result = await MilestoneCommands.create({
        roadmapId,
        title,
        description,
        status,
        progress,
        order,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Roadmap not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetMilestoneRequest, reply: FastifyReply) {
    try {
      const { roadmapId, id } = request.params

      const result = await MilestoneQueries.getById(id, roadmapId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Milestone not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateMilestoneRequest, reply: FastifyReply) {
    try {
      const { roadmapId, id } = request.params
      const updateData = { ...request.body }

      // Converte datas se fornecidas
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate).toISOString()
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate).toISOString()
      }

      const result = await MilestoneCommands.update(id, roadmapId, updateData as any)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Milestone not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Validation error') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteMilestoneRequest, reply: FastifyReply) {
    try {
      const { roadmapId, id } = request.params

      await MilestoneCommands.delete(id, roadmapId)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Milestone not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: ListMilestonesRequest, reply: FastifyReply) {
    try {
      const { roadmapId } = request.params
      const { status, page = 1, limit = 50 } = request.query

      const result = await MilestoneQueries.listByRoadmap(roadmapId, {
        status,
        page,
        limit,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (QUERIES) ===
  async getByStatus(
    request: FastifyRequest<{
      Params: { roadmapId: string }
      Querystring: { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params
      const { status } = request.query

      const result = await MilestoneQueries.getByStatus(roadmapId, status)

      return reply.send({ milestones: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest<{ Params: { roadmapId: string } }>, reply: FastifyReply) {
    try {
      const { roadmapId } = request.params

      const result = await MilestoneQueries.getStats(roadmapId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getUpcoming(
    request: FastifyRequest<{
      Params: { roadmapId: string }
      Querystring: { limit?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params
      const { limit = 5 } = request.query

      const result = await MilestoneQueries.getUpcoming(roadmapId, limit)

      return reply.send({ milestones: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getOverdue(
    request: FastifyRequest<{ Params: { roadmapId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params

      const result = await MilestoneQueries.getOverdue(roadmapId)

      return reply.send({ milestones: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getInProgress(
    request: FastifyRequest<{ Params: { roadmapId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params

      const result = await MilestoneQueries.getInProgress(roadmapId)

      return reply.send({ milestones: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getTimeline(
    request: FastifyRequest<{ Params: { roadmapId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params

      const result = await MilestoneQueries.getTimeline(roadmapId)

      return reply.send({ timeline: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(
    request: FastifyRequest<{
      Params: { roadmapId: string }
      Querystring: { q: string; limit?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params
      const { q, limit = 10 } = request.query

      const result = await MilestoneQueries.search(roadmapId, q, limit)

      return reply.send({ milestones: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async updateProgress(request: UpdateMilestoneProgressRequest, reply: FastifyReply) {
    try {
      const { roadmapId, id } = request.params
      const { progress } = request.body

      const result = await MilestoneCommands.updateProgress(id, roadmapId, progress)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Milestone not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Progress must be between 0 and 100') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async updateStatus(request: UpdateMilestoneStatusRequest, reply: FastifyReply) {
    try {
      const { roadmapId, id } = request.params
      const { status } = request.body

      const result = await MilestoneCommands.updateStatus(id, roadmapId, status)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Milestone not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async reorder(
    request: FastifyRequest<{
      Params: { roadmapId: string }
      Body: { milestoneIds: string[] }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { roadmapId } = request.params
      const { milestoneIds } = request.body

      const result = await MilestoneCommands.reorder(roadmapId, milestoneIds)

      return reply.send({ milestones: result })
    } catch (error: any) {
      request.log.error(error)

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
