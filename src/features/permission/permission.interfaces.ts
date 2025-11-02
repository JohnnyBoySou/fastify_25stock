import type { FastifyRequest } from 'fastify'

// ================================
// TIPOS DE PERMISSÃO
// ================================

export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'MANAGE'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | string // Permite ações customizadas

export type PermissionResource =
  | 'USERS'
  | 'PRODUCTS'
  | 'STORES'
  | 'ORDERS'
  | 'INVENTORY'
  | 'REPORTS'
  | 'SETTINGS'
  | 'PERMISSIONS'
  | string // Permite recursos customizados

export interface Permission {
  id: string
  name: string
  description: string
  resource: PermissionResource
  action: PermissionAction
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ================================
// INTERFACES PARA LISTAR PERMISSÕES DISPONÍVEIS
// ================================

export interface ListAvailablePermissionsRequest extends FastifyRequest {
  Querystring: {
    resource?: PermissionResource
    action?: PermissionAction
    search?: string
  }
}

// ================================
// INTERFACES PARA ATRIBUIÇÃO DE PERMISSÕES A USUÁRIOS
// ================================

export interface AssignPermissionsToUserRequest extends FastifyRequest {
  Body: {
    userId: string
    permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
    scope?: string
    expiresAt?: string
    conditions?: any
  }
}

export interface RemovePermissionsFromUserRequest extends FastifyRequest {
  Body: {
    userId: string
    permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
  }
}

export interface GetUserPermissionsRequest extends FastifyRequest {
  Params: { userId: string }
  Querystring: {
    page?: number
    limit?: number
  }
}

export interface CheckUserPermissionRequest extends FastifyRequest {
  Body: {
    userId: string
    resource: PermissionResource
    action: PermissionAction
  }
}

// ================================
// INTERFACES PARA RECURSOS E AÇÕES
// ================================

export interface GetResourcesRequest extends FastifyRequest {
  Querystring: {
    search?: string
  }
}

export interface GetActionsRequest extends FastifyRequest {
  Querystring: {
    search?: string
  }
}

// ================================
// INTERFACES DE RESPOSTA
// ================================

export interface PermissionResponse {
  id: string
  name: string
  description: string
  resource: PermissionResource
  action: PermissionAction
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserPermission {
  id: string
  userId: string
  permissionId: string
  assignedAt: Date
  assignedBy: string
  permission?: PermissionResponse
}

export interface CheckPermissionResponse {
  userId: string
  resource: PermissionResource
  action: PermissionAction
  hasPermission: boolean
  permissionName?: string
}

export interface PermissionStatsResponse {
  totalPermissions: number
  activePermissions: number
  inactivePermissions: number
  permissionsByResource: Array<{
    resource: PermissionResource
    count: number
  }>
  permissionsByAction: Array<{
    action: PermissionAction
    count: number
  }>
  totalUserPermissions: number
}

// ================================
// INTERFACES PARA PAGINAÇÃO
// ================================

export interface PaginatedPermissionsResponse {
  permissions: PermissionResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginatedUserPermissionsResponse {
  permissions: UserPermission[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
