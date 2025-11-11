import type { FastifyReply, FastifyRequest } from 'fastify'
import { FlowExecutionCommands } from './commands/flow-execution.commands'
import type {
  CancelExecutionRequest,
  GetByFlowRequest,
  GetFlowExecutionRequest,
  GetStatsRequest,
  ListFlowExecutionsRequest,
} from './flow-execution.interfaces'
import { FlowExecutionQueries } from './queries/flow-execution.queries'

export const FlowExecutionController = {
  async get(request: FastifyRequest<GetFlowExecutionRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await FlowExecutionQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Flow execution not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow execution not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: FastifyRequest<ListFlowExecutionsRequest>, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 10,
        flowId,
        status,
        triggerType,
        startDate,
        endDate,
      } = request.query

      const result = await FlowExecutionQueries.list({
        page,
        limit,
        flowId,
        status,
        triggerType,
        startDate,
        endDate,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByFlow(request: FastifyRequest<GetByFlowRequest>, reply: FastifyReply) {
    try {
      const { flowId } = request.params
      const { page = 1, limit = 10, status } = request.query

      const result = await FlowExecutionQueries.getByFlow(flowId, {
        page,
        limit,
        status,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest<GetStatsRequest>, reply: FastifyReply) {
    try {
      const { flowId } = request.params

      const result = await FlowExecutionQueries.getStats(flowId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async cancel(request: FastifyRequest<CancelExecutionRequest>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await FlowExecutionCommands.cancel(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Flow execution not found') {
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
