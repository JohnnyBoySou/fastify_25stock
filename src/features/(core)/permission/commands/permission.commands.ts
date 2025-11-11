import type { PermissionAction, PermissionResource } from '../permission.interfaces'
import { db } from '@/plugins/prisma'
import { AVAILABLE_PERMISSIONS, getPermissionDefinition } from '../permission.constants'

// ================================
// PERMISSION COMMANDS
// ================================

export const PermissionCommands = {
  // Atribuir permissões a usuário
  async assignToUser(data: {
    userId: string
    permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
    assignedBy: string
    scope?: string
    expiresAt?: Date | null
    conditions?: any
  }) {
    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verificar se todas as permissões estão na lista pré-definida
    const invalidPermissions = data.permissions.filter(
      (p) => !getPermissionDefinition(p.resource, p.action)
    )

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Invalid permissions: ${invalidPermissions.map((p) => `${p.resource}:${p.action}`).join(', ')}`
      )
    }

    // Buscar permissões já atribuídas
    const existingPermissions = await db.userPermission.findMany({
      where: {
        userId: data.userId,
        OR: data.permissions.map((p) => ({
          resource: p.resource,
          action: p.action,
        })),
      },
    })

    // Criar mapa de permissões existentes
    const existingMap = new Map(
      existingPermissions.map((ep) => [`${ep.resource}:${ep.action}`, ep])
    )

    // Filtrar apenas permissões novas
    const newPermissions = data.permissions.filter(
      (p) => !existingMap.has(`${p.resource}:${p.action}`)
    )

    if (newPermissions.length === 0) {
      return {
        message: 'All permissions already assigned',
        assigned: 0,
      }
    }

    // Criar novas atribuições
    await db.userPermission.createMany({
      data: newPermissions.map((p) => ({
        userId: data.userId,
        resource: p.resource,
        action: p.action,
        scope: data.scope || null,
        grant: true,
        expiresAt: data.expiresAt || null,
        conditions: data.conditions ? JSON.stringify(data.conditions) : null,
      })),
      skipDuplicates: true,
    })

    return {
      message: 'Permissions assigned successfully',
      assigned: newPermissions.length,
      permissions: newPermissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
    }
  },

  // Remover permissões de usuário
  async removeFromUser(data: {
    userId: string
    permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
  }) {
    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const result = await db.userPermission.deleteMany({
      where: {
        userId: data.userId,
        OR: data.permissions.map((p) => ({
          resource: p.resource,
          action: p.action,
        })),
      },
    })

    return {
      message: 'Permissions removed successfully',
      removed: result.count,
    }
  },

  // Remover todas as permissões de um usuário
  async removeAllFromUser(userId: string) {
    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const result = await db.userPermission.deleteMany({
      where: { userId },
    })

    return {
      message: 'All permissions removed successfully',
      removed: result.count,
    }
  },

  // Sincronizar permissões de usuário (substitui todas)
  async syncUserPermissions(data: {
    userId: string
    permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
    assignedBy: string
    scope?: string
    expiresAt?: Date | null
    conditions?: any
  }) {
    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verificar se todas as permissões estão na lista pré-definida
    const invalidPermissions = data.permissions.filter(
      (p) => !getPermissionDefinition(p.resource, p.action)
    )

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Invalid permissions: ${invalidPermissions.map((p) => `${p.resource}:${p.action}`).join(', ')}`
      )
    }

    // Usar transação para garantir atomicidade
    return await db.$transaction(async (tx: any) => {
      // Remover todas as permissões atuais
      await tx.userPermission.deleteMany({
        where: { userId: data.userId },
      })

      // Adicionar novas permissões
      if (data.permissions.length > 0) {
        await tx.userPermission.createMany({
          data: data.permissions.map((p) => ({
            userId: data.userId,
            resource: p.resource,
            action: p.action,
            scope: data.scope || null,
            grant: true,
            expiresAt: data.expiresAt || null,
            conditions: data.conditions ? JSON.stringify(data.conditions) : null,
          })),
        })
      }

      return {
        message: 'Permissions synchronized successfully',
        total: data.permissions.length,
        permissions: data.permissions,
      }
    })
  },

  // Atualizar uma permissão específica de usuário
  async updateUserPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
    data: {
      grant?: boolean
      scope?: string | null
      expiresAt?: Date | null
      conditions?: any
    }
  ) {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const permission = await db.userPermission.findFirst({
      where: {
        userId,
        resource,
        action,
      },
    })

    if (!permission) {
      throw new Error('Permission not found for this user')
    }

    return await db.userPermission.update({
      where: {
        id: permission.id,
      },
      data: {
        grant: data.grant !== undefined ? data.grant : permission.grant,
        scope: data.scope !== undefined ? data.scope : permission.scope,
        expiresAt: data.expiresAt !== undefined ? data.expiresAt : permission.expiresAt,
        conditions:
          data.conditions !== undefined ? JSON.stringify(data.conditions) : permission.conditions,
      },
    })
  },
}
