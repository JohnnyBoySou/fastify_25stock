import type { FastifyRequest } from 'fastify'

// Interfaces para Notification
export interface CreateNotificationRequest
  extends FastifyRequest<{
    Body: {
      userId: string
      title: string
      message: string
      type?:
        | 'INFO'
        | 'SUCCESS'
        | 'WARNING'
        | 'ERROR'
        | 'STOCK_ALERT'
        | 'MOVEMENT'
        | 'PERMISSION'
        | 'SYSTEM'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      data?: any
      actionUrl?: string
      expiresAt?: string
    }
  }> {}

export interface UpdateNotificationRequest
  extends FastifyRequest<{
    Params: { id: string }
    Body: {
      title?: string
      message?: string
      type?:
        | 'INFO'
        | 'SUCCESS'
        | 'WARNING'
        | 'ERROR'
        | 'STOCK_ALERT'
        | 'MOVEMENT'
        | 'PERMISSION'
        | 'SYSTEM'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      data?: any
      actionUrl?: string
      expiresAt?: string
    }
  }> {}

export interface GetNotificationRequest
  extends FastifyRequest<{
    Params: { id: string }
  }> {}

export interface ListNotificationsRequest
  extends FastifyRequest<{
    Querystring: {
      page?: number
      limit?: number
      search?: string
      type?:
        | 'INFO'
        | 'SUCCESS'
        | 'WARNING'
        | 'ERROR'
        | 'STOCK_ALERT'
        | 'MOVEMENT'
        | 'PERMISSION'
        | 'SYSTEM'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      isRead?: boolean
      userId?: string
    }
  }> {}

export interface DeleteNotificationRequest
  extends FastifyRequest<{
    Params: { id: string }
  }> {}

export interface MarkAsReadRequest
  extends FastifyRequest<{
    Params: { id: string }
  }> {}

export interface MarkAllAsReadRequest
  extends FastifyRequest<{
    Body: {
      userId: string
    }
  }> {}

export interface GetByUserRequest
  extends FastifyRequest<{
    Params: { userId: string }
    Querystring: {
      page?: number
      limit?: number
      isRead?: boolean
      type?:
        | 'INFO'
        | 'SUCCESS'
        | 'WARNING'
        | 'ERROR'
        | 'STOCK_ALERT'
        | 'MOVEMENT'
        | 'PERMISSION'
        | 'SYSTEM'
    }
  }> {}

export interface GetUnreadRequest
  extends FastifyRequest<{
    Params: { userId: string }
    Querystring: {
      limit?: number
    }
  }> {}

export interface GetByTypeRequest
  extends FastifyRequest<{
    Params: {
      type:
        | 'INFO'
        | 'SUCCESS'
        | 'WARNING'
        | 'ERROR'
        | 'STOCK_ALERT'
        | 'MOVEMENT'
        | 'PERMISSION'
        | 'SYSTEM'
    }
    Querystring: {
      limit?: number
    }
  }> {}

export interface GetByPriorityRequest
  extends FastifyRequest<{
    Params: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }
    Querystring: {
      limit?: number
    }
  }> {}

export interface GetRecentRequest
  extends FastifyRequest<{
    Params: { userId: string }
    Querystring: {
      days?: number
      limit?: number
    }
  }> {}

export interface GetStatsRequest
  extends FastifyRequest<{
    Querystring: {
      userId?: string
    }
  }> {}

export interface SearchRequest
  extends FastifyRequest<{
    Querystring: {
      q: string
      limit?: number
    }
  }> {}

export interface NotificationResponse {
  id: string
  userId: string
  title: string
  message: string
  type:
    | 'INFO'
    | 'SUCCESS'
    | 'WARNING'
    | 'ERROR'
    | 'STOCK_ALERT'
    | 'MOVEMENT'
    | 'PERMISSION'
    | 'SYSTEM'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isRead: boolean
  readAt: string | null
  data: any
  actionUrl: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export interface NotificationStatsResponse {
  total: number
  unread: number
  read: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}
