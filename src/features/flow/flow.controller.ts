import type { FastifyReply, FastifyRequest } from 'fastify'

import { FlowCommands } from './commands/flow.commands'
import { FlowQueries } from './queries/flow.queries'

import type {
  CreateFlowRequest,
  DeleteFlowRequest,
  DuplicateFlowRequest,
  GetFlowRequest,
  ListFlowsRequest,
  TestFlowRequest,
  UpdateFlowRequest,
  UpdateFlowStatusRequest,
} from './flow.interfaces'

export const FlowController = {
  // === CRUD BÁSICO ===
  async create(request: FastifyRequest<CreateFlowRequest>, reply: FastifyReply) {
    try {
      const { name, description, nodes, edges, status } = request.body
      const storeId = request.store?.id
      const userId = request.user?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      const result = await FlowCommands.create({
        name,
        description,
        nodes,
        edges,
        status: status || 'DRAFT',
        storeId,
        createdBy: userId,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found' || error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: FastifyRequest<GetFlowRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const result = await FlowQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Flow not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: FastifyRequest<UpdateFlowRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await FlowCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: FastifyRequest<DeleteFlowRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params

      await FlowCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: FastifyRequest<ListFlowsRequest>, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await FlowQueries.list({
        page,
        limit,
        search,
        status,
        storeId,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS ===
  async updateStatus(request: FastifyRequest<UpdateFlowStatusRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { status } = request.body

      const result = await FlowCommands.updateStatus(id, status)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async duplicate(request: FastifyRequest<DuplicateFlowRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { name } = request.body || {}

      const result = await FlowCommands.duplicate(id, name)

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async test(request: FastifyRequest<TestFlowRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params

      // Buscar o flow
      const flow = await FlowQueries.getById(id)

      if (!flow) {
        return reply.status(404).send({
          error: 'Flow not found',
        })
      }

      // TODO: Implementar execução do workflow de teste
      // Por enquanto, retornar mock
      return reply.send({
        executionId: `test-${Date.now()}`,
        status: 'success',
        executionLog: [
          {
            nodeId: 'trigger-1',
            nodeType: 'trigger',
            status: 'success',
            timestamp: new Date(),
            message: 'Test execution completed',
          },
        ],
      })
    } catch (error: any) {
      request.log.error(error)

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByStore(
    request: FastifyRequest<{ Querystring: { storeId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await FlowQueries.getByStore(storeId)

      return reply.send({ flows: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(
    request: FastifyRequest<{ Querystring: { storeId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const storeId = request.store?.id

      const result = await FlowQueries.getStats(storeId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(
    request: FastifyRequest<{
      Querystring: { searchTerm: string; limit?: number; page?: number; storeId?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { searchTerm, limit = 10, page = 1 } = request.query
      const storeId = request.store?.id

      const result = await FlowQueries.search({ searchTerm, storeId, limit, page })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
