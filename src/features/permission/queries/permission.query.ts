import type { PermissionAction, PermissionResource } from '../permission.interfaces'
import { db } from '@/plugins/prisma'
import {
  AVAILABLE_PERMISSIONS,
  getAvailableResources,
  getAvailableActions,
  getPermissionsByResource,
  getPermissionsByAction,
  getPermissionDefinition,
} from '../permission.constants'

export const PermissionQueries = {
  // Listar todas as permissões disponíveis (lista pré-definida)
  async listAvailable(filters?: {
    resource?: PermissionResource
    action?: PermissionAction
    search?: string
  }) {
    let permissions = [...AVAILABLE_PERMISSIONS]

    if (filters?.resource) {
      permissions = permissions.filter((p) => p.resource === filters.resource)
    }

    if (filters?.action) {
      permissions = permissions.filter((p) => p.action === filters.action)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      permissions = permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.resource.toLowerCase().includes(searchLower) ||
          p.action.toLowerCase().includes(searchLower)
      )
    }

    return permissions.sort((a, b) => {
      if (a.resource !== b.resource) {
        return a.resource.localeCompare(b.resource)
      }
      return a.action.localeCompare(b.action)
    })
  },

  // Buscar permissões disponíveis por recurso
  async getByResource(resource: PermissionResource) {
    return getPermissionsByResource(resource)
  },

  // Buscar permissões disponíveis por ação
  async getByAction(action: PermissionAction) {
    return getPermissionsByAction(action)
  },

  // Listar recursos disponíveis
  async getResources(search?: string) {
    let resources = getAvailableResources()

    if (search) {
      const searchLower = search.toLowerCase()
      resources = resources.filter((r) => r.toLowerCase().includes(searchLower))
    }

    return resources
  },

  // Listar ações disponíveis
  async getActions(search?: string) {
    let actions = getAvailableActions()

    if (search) {
      const searchLower = search.toLowerCase()
      actions = actions.filter((a) => a.toLowerCase().includes(searchLower))
    }

    return actions
  },

  // Buscar permissões atribuídas a um usuário
  async getUserPermissions(filters: { userId: string; page?: number; limit?: number }) {
    const { userId, page = 1, limit = 10 } = filters

    const [userPermissions, total] = await Promise.all([
      db.userPermission.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.userPermission.count({
        where: { userId },
      }),
    ])

    // Enriquecer com informações da lista pré-definida
    const enrichedPermissions = userPermissions.map((up) => {
      const permissionDef = getPermissionDefinition(up.resource, up.action as PermissionAction)
      return {
        ...up,
        permission: permissionDef || null,
      }
    })

    return {
      permissions: enrichedPermissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  // Verificar se usuário tem permissão específica
  async checkUserPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction
  ) {
    // Verificar se a permissão existe na lista pré-definida
    const permissionDef = getPermissionDefinition(resource, action)

    if (!permissionDef) {
      return {
        userId,
        resource,
        action,
        hasPermission: false,
        permissionName: null,
        message: 'Permission not found in available permissions',
      }
    }

    // Verificar se usuário tem essa permissão atribuída
    const userPermission = await db.userPermission.findFirst({
      where: {
        userId,
        resource,
        action,
      },
    })

    const hasPermission =
      userPermission !== null &&
      userPermission.grant === true &&
      (userPermission.expiresAt === null || userPermission.expiresAt > new Date())

    return {
      userId,
      resource,
      action,
      hasPermission,
      permissionName: permissionDef.name,
      userPermission: userPermission
        ? {
            grant: userPermission.grant,
            scope: userPermission.scope,
            expiresAt: userPermission.expiresAt,
            conditions: userPermission.conditions
              ? JSON.parse(userPermission.conditions as string)
              : null,
          }
        : null,
    }
  },

  // Listar usuários com determinada permissão
  async getUsersWithPermission(
    resource: PermissionResource,
    action: PermissionAction,
    filters?: { page?: number; limit?: number }
  ) {
    const { page = 1, limit = 10 } = filters || {}

    const [userPermissions, total] = await Promise.all([
      db.userPermission.findMany({
        where: {
          resource,
          action,
          grant: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.userPermission.count({
        where: {
          resource,
          action,
          grant: true,
        },
      }),
    ])

    const permissionDef = getPermissionDefinition(resource, action)

    return {
      permission: permissionDef || null,
      users: userPermissions.map((up) => ({
        id: up.user.id,
        name: up.user.name,
        email: up.user.email,
        assignedAt: up.createdAt,
        scope: up.scope,
        expiresAt: up.expiresAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  // Estatísticas de permissões
  async getStats() {
    const [
      totalUserPermissions,
      activeUserPermissions,
      expiredUserPermissions,
      permissionsByResource,
      permissionsByAction,
    ] = await Promise.all([
      db.userPermission.count(),
      db.userPermission.count({
        where: {
          grant: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      }),
      db.userPermission.count({
        where: {
          expiresAt: { lte: new Date() },
        },
      }),
      db.userPermission.groupBy({
        by: ['resource'],
        _count: { resource: true },
        where: { grant: true },
        orderBy: { _count: { resource: 'desc' } },
      }),
      db.userPermission.groupBy({
        by: ['action'],
        _count: { action: true },
        where: { grant: true },
        orderBy: { _count: { action: 'desc' } },
      }),
    ])

    return {
      availablePermissions: AVAILABLE_PERMISSIONS.length,
      totalUserPermissions,
      activeUserPermissions,
      expiredUserPermissions,
      permissionsByResource: permissionsByResource.map((p) => ({
        resource: p.resource,
        count: p._count.resource,
      })),
      permissionsByAction: permissionsByAction.map((p) => ({
        action: p.action,
        count: p._count.action,
      })),
    }
  },

  // Buscar permissões de um usuário por recurso
  async getUserPermissionsByResource(userId: string, resource: PermissionResource) {
    const userPermissions = await db.userPermission.findMany({
      where: {
        userId,
        resource,
        grant: true,
      },
      orderBy: { action: 'asc' },
    })

    const permissionDefs = userPermissions.map((up) =>
      getPermissionDefinition(up.resource, up.action as PermissionAction)
    )

    return {
      resource,
      permissions: userPermissions.map((up, index) => ({
        ...up,
        definition: permissionDefs[index] || null,
      })),
    }
  },
}
