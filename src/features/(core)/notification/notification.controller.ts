import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotificationCommands } from './commands/notification.commands'
import type {
  CreateNotificationRequest,
  DeleteNotificationRequest,
  GetByPriorityRequest,
  GetByTypeRequest,
  GetByUserRequest,
  GetNotificationRequest,
  GetRecentRequest,
  GetStatsRequest,
  GetUnreadRequest,
  ListNotificationsRequest,
  MarkAllAsReadRequest,
  MarkAsReadRequest,
  SearchRequest,
  UpdateNotificationRequest,
} from './notification.interfaces'
import { NotificationQueries } from './queries/notification.queries'

export const NotificationController = {
  // === CRUD BÁSICO ===
  async create(request: CreateNotificationRequest, reply: FastifyReply) {
    try {
      const { userId, title, message, type, priority, data, actionUrl, expiresAt } = request.body

      const result = await NotificationCommands.create({
        userId,
        title,
        message,
        type,
        priority,
        data,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetNotificationRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await NotificationQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Notification not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Notification not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateNotificationRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      // Convert expiresAt string to Date if provided
      if (updateData.expiresAt) {
        updateData.expiresAt = new Date(updateData.expiresAt) as any
      }

      const result = await NotificationCommands.update(id, updateData as any)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Notification not found') {
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

  async delete(request: DeleteNotificationRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await NotificationCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Notification not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: ListNotificationsRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, type, priority, isRead, userId } = request.query

      const result = await NotificationQueries.list({
        page,
        limit,
        search,
        type,
        priority,
        isRead,
        userId,
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
  async getByUser(request: GetByUserRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params
      const { page = 1, limit = 10, isRead, type } = request.query

      const result = await NotificationQueries.getByUser(userId, {
        page,
        limit,
        isRead,
        type,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getUnread(request: GetUnreadRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params
      const { limit = 10 } = request.query

      const result = await NotificationQueries.getUnread(userId, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByType(request: GetByTypeRequest, reply: FastifyReply) {
    try {
      const { type } = request.params
      const { limit = 10 } = request.query

      const result = await NotificationQueries.getByType(type, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByPriority(request: GetByPriorityRequest, reply: FastifyReply) {
    try {
      const { priority } = request.params
      const { limit = 10 } = request.query

      const result = await NotificationQueries.getByPriority(priority, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getRecent(request: GetRecentRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params
      const { days = 7, limit = 20 } = request.query

      const result = await NotificationQueries.getRecent(userId, days, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: GetStatsRequest, reply: FastifyReply) {
    try {
      const { userId } = request.query

      const result = await NotificationQueries.getStats(userId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(request: SearchRequest, reply: FastifyReply) {
    try {
      const { q, limit = 10 } = request.query

      const result = await NotificationQueries.search(q, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async markAsRead(request: MarkAsReadRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await NotificationCommands.markAsRead(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Notification not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async markAsUnread(request: MarkAsReadRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await NotificationCommands.markAsUnread(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Notification not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async markAllAsRead(request: MarkAllAsReadRequest, reply: FastifyReply) {
    try {
      const { userId } = request.body

      const result = await NotificationCommands.markAllAsRead(userId)

      return reply.send({
        success: true,
        count: result.count,
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async deleteExpired(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await NotificationCommands.deleteExpired()

      return reply.send({
        success: true,
        count: result.count,
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async deleteByUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId } = request.params

      const result = await NotificationCommands.deleteByUser(userId)

      return reply.send({
        success: true,
        count: result.count,
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === ENDPOINTS ESPECÍFICOS PARA ALERTAS DE ESTOQUE ===
  async getStockAlerts(
    request: FastifyRequest<{
      Querystring: {
        userId?: string
        storeId?: string
        isRead?: boolean
        limit?: number
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, storeId, isRead, limit = 20 } = request.query

      const result = await NotificationQueries.getStockAlerts({
        userId,
        storeId,
        isRead,
        limit,
      })

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getUnreadStockAlerts(
    request: FastifyRequest<{
      Params: { userId: string }
      Querystring: { limit?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params
      const { limit = 10 } = request.query

      const result = await NotificationQueries.getUnreadStockAlerts(userId, limit)

      return reply.send({ notifications: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async markStockAlertsAsRead(
    request: FastifyRequest<{
      Body: { userId: string; storeId?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, storeId } = request.body

      const result = await NotificationCommands.markStockAlertsAsRead(userId, storeId)

      return reply.send({
        success: true,
        count: result.count,
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
