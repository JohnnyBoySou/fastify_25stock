import type { FastifyReply, FastifyRequest } from 'fastify'
import { SubscriptionCommands } from './commands/subscription.commands'
import type {
  CreateSubscriptionRequest,
  DeleteSubscriptionRequest,
  GetSubscriptionCustomersRequest,
  GetSubscriptionRequest,
  ListSubscriptionsRequest,
  SubscriptionInterval,
  CompareSubscriptionsRequest,
  UpdateSubscriptionRequest,
  UpdateSubscriptionStatusRequest,
} from './subscription.interfaces'
import { SubscriptionQueries } from './queries/subscription.queries'

export const SubscriptionController = {
  // === CRUD BÁSICO ===
  async create(request: CreateSubscriptionRequest, reply: FastifyReply) {
    try {
      const { userId, description, price, interval, features } = request.body
      const result = await SubscriptionCommands.create({
        userId,
        description,
        price,
        interval: interval as unknown as SubscriptionInterval,
        features,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Plan with this name already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetSubscriptionRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await SubscriptionQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Plan not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Plan not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateSubscriptionRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await SubscriptionCommands.update(
        id,
        updateData as unknown as {
          userId?: string
          description?: string
          price?: number
          interval?: SubscriptionInterval
          features?: any
        }
      )

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Plan not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Plan with this name already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteSubscriptionRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await SubscriptionCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Subscription not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (
        error.message.includes('Cannot delete subscription') &&
        error.message.includes('associated customers')
      ) {
        return reply.status(400).send({
          error: error.message,
          suggestion:
            'Use DELETE /subscriptions/:id/force to delete the subscription and remove all customer associations',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async forceDelete(request: DeleteSubscriptionRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await SubscriptionCommands.forceDelete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Subscription not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: ListSubscriptionsRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, interval } = request.query
      const result = await SubscriptionQueries.list({
        page,
        limit,
        search,
        interval,
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
      const result = await SubscriptionQueries.getActive()

      return reply.send({ subscriptions: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async compare(request: CompareSubscriptionsRequest, reply: FastifyReply) {
    try {
      const { subscriptionIds } = request.query
      const result = await SubscriptionQueries.compare(subscriptionIds)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'At least one subscription ID is required for comparison') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.message === 'No subscriptions found for comparison') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getCustomers(request: GetSubscriptionCustomersRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { page = 1, limit = 10, status } = request.query

      const result = await SubscriptionQueries.getCustomers(id, {
        page,
        limit,
        status,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Plan not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await SubscriptionQueries.getStats()

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async updateStatus(request: UpdateSubscriptionStatusRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const { active } = request.body

      const result = await SubscriptionCommands.updateStatus(id, active)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Subscription not found') {
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
