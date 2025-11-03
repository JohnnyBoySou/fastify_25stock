import type { FastifyReply, FastifyRequest } from 'fastify'
import { PermissionCommands } from './commands/permission.commands'
import { PermissionQueries } from './queries/permission.query'
import type {
  AssignPermissionsToUserRequest,
  RemovePermissionsFromUserRequest,
  GetUserPermissionsRequest,
  CheckUserPermissionRequest,
  GetResourcesRequest,
  GetActionsRequest,
} from './permission.interfaces'
import type { PermissionAction, PermissionResource } from './permission.interfaces'

export const PermissionController = {
  // ================================
  // LISTAR PERMISSÕES DISPONÍVEIS (LISTA PRÉ-DEFINIDA)
  // ================================

  async listAvailable(
    request: FastifyRequest<{
      Querystring: {
        resource?: PermissionResource
        action?: PermissionAction
        search?: string
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const query = request.query
      const result = await PermissionQueries.listAvailable({
        resource: query.resource,
        action: query.action,
        search: query.search,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByResource(
    request: FastifyRequest<{ Params: { resource: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { resource } = request.params
      const result = await PermissionQueries.getByResource(resource as PermissionResource)

      return reply.send({ permissions: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByAction(request: FastifyRequest<{ Params: { action: string } }>, reply: FastifyReply) {
    try {
      const { action } = request.params
      const result = await PermissionQueries.getByAction(action as PermissionAction)

      return reply.send({ permissions: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getResources(request: GetResourcesRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetResourcesRequest['Querystring']
      const { search } = query
      const result = await PermissionQueries.getResources(search)

      return reply.send({ resources: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getActions(request: GetActionsRequest, reply: FastifyReply) {
    try {
      const query = request.query as GetActionsRequest['Querystring']
      const { search } = query
      const result = await PermissionQueries.getActions(search)

      return reply.send({ actions: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await PermissionQueries.getStats()

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // ================================
  // ATRIBUIÇÃO DE PERMISSÕES A USUÁRIOS
  // ================================

  async assignToUser(request: AssignPermissionsToUserRequest, reply: FastifyReply) {
    try {
      const body = request.body as AssignPermissionsToUserRequest['Body']
      const { userId, permissions } = body

      const currentUserId = (request as any).user?.id || 'system'

      const result = await PermissionCommands.assignToUser({
        userId,
        permissions,
        assignedBy: currentUserId,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found' || error.message.includes('Invalid permissions')) {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async removeFromUser(request: RemovePermissionsFromUserRequest, reply: FastifyReply) {
    try {
      const body = request.body as RemovePermissionsFromUserRequest['Body']
      const { userId, permissions } = body

      const result = await PermissionCommands.removeFromUser({
        userId,
        permissions,
      })

      return reply.send(result)
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

  async removeAllFromUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params
      const result = await PermissionCommands.removeAllFromUser(userId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async syncUserPermissions(
    request: FastifyRequest<{
      Body: {
        userId: string
        permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
        scope?: string
        expiresAt?: string
        conditions?: any
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const body = request.body
      const { userId, permissions, scope, expiresAt, conditions } = body

      const currentUserId = (request as any).user?.id || 'system'

      const result = await PermissionCommands.syncUserPermissions({
        userId,
        permissions,
        assignedBy: currentUserId,
        scope,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        conditions,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found' || error.message.includes('Invalid permissions')) {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getUserPermissions(request: GetUserPermissionsRequest, reply: FastifyReply) {
    try {
      const params = request.params as GetUserPermissionsRequest['Params']
      const query = request.query as GetUserPermissionsRequest['Querystring']
      const { userId } = params
      const { page = 1, limit = 10 } = query

      const result = await PermissionQueries.getUserPermissions({
        userId,
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

  async checkUserPermission(request: CheckUserPermissionRequest, reply: FastifyReply) {
    try {
      const body = request.body as CheckUserPermissionRequest['Body']
      const { userId, resource, action } = body

      const result = await PermissionQueries.checkUserPermission(userId, resource, action)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getUsersWithPermission(
    request: FastifyRequest<{
      Params: { resource: string; action: string }
      Querystring: { page?: number; limit?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { resource, action } = request.params
      const { page = 1, limit = 10 } = request.query

      const result = await PermissionQueries.getUsersWithPermission(
        resource as PermissionResource,
        action as PermissionAction,
        {
          page,
          limit,
        }
      )

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
