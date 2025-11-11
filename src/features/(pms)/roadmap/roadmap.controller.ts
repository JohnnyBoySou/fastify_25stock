import type { FastifyReply, FastifyRequest } from 'fastify'
import { RoadmapCommands } from './commands/roadmap.commands'
import { RoadmapQueries } from './queries/roadmap.queries'
import type {
  CreateRoadmapRequest,
  DeleteRoadmapRequest,
  GetRoadmapRequest,
  ListRoadmapsRequest,
  RoadmapStatus,
  UpdateRoadmapRequest,
} from './roadmap.interfaces'

export const RoadmapController = {
  // === CRUD BÁSICO ===
  async create(request: CreateRoadmapRequest, reply: FastifyReply) {
    try {
      const data: any = { ...request.body }

      // Converter datas string para Date objects se fornecidas
      if (data.startDate) {
        data.startDate = new Date(data.startDate)
      }
      if (data.endDate) {
        data.endDate = new Date(data.endDate)
      }

      const result = await RoadmapCommands.create(data)

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Specific error message') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetRoadmapRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await RoadmapQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Roadmap not found',
        })
      }

      return reply.send(result)
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

  async update(request: UpdateRoadmapRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData: any = { ...request.body }

      // Converter datas string para Date objects se fornecidas
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate)
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate)
      }

      const result = await RoadmapCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Roadmap not found') {
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

  async delete(request: DeleteRoadmapRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await RoadmapCommands.delete(id)

      return reply.status(204).send()
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

  async list(request: ListRoadmapsRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status } = request.query

      const result = await RoadmapQueries.list({
        page,
        limit,
        search,
        status: status as RoadmapStatus,
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
  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await RoadmapQueries.getActive()

      return reply.send({ roadmaps: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await RoadmapQueries.getStats()

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(
    request: FastifyRequest<{ Querystring: { q: string; limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { q, limit = 10 } = request.query

      const result = await RoadmapQueries.search(q, limit)

      return reply.send({ roadmaps: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async updateStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: boolean } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { status } = request.body

      const result = await RoadmapCommands.updateStatus(id, status as unknown as RoadmapStatus)

      return reply.send(result)
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
}
