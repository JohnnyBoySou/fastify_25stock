import type { FastifySchema } from 'fastify'

const notificationTypeEnum = [
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'STOCK_ALERT',
  'MOVEMENT',
  'PERMISSION',
  'SYSTEM',
]
const notificationPriorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const notificationResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    title: { type: 'string' },
    message: { type: 'string' },
    type: { type: 'string', enum: notificationTypeEnum },
    priority: { type: 'string', enum: notificationPriorityEnum },
    isRead: { type: 'boolean' },
    readAt: { type: ['string', 'null'], format: 'date-time' },
    data: { type: 'object' },
    actionUrl: { type: ['string', 'null'] },
    expiresAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: ['string', 'null'] },
        email: { type: 'string' },
      },
    },
  },
}

export const createNotificationSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['userId', 'title', 'message'],
    properties: {
      userId: { type: 'string' },
      title: { type: 'string', minLength: 1, maxLength: 255 },
      message: { type: 'string', minLength: 1, maxLength: 1000 },
      type: { type: 'string', enum: notificationTypeEnum, default: 'INFO' },
      priority: { type: 'string', enum: notificationPriorityEnum, default: 'MEDIUM' },
      data: { type: 'object' },
      actionUrl: { type: 'string', format: 'uri' },
      expiresAt: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    201: notificationResponseSchema,
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const updateNotificationSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      message: { type: 'string', minLength: 1, maxLength: 1000 },
      type: { type: 'string', enum: notificationTypeEnum },
      priority: { type: 'string', enum: notificationPriorityEnum },
      data: { type: 'object' },
      actionUrl: { type: 'string', format: 'uri' },
      expiresAt: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    200: notificationResponseSchema,
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getNotificationSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: notificationResponseSchema,
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const listNotificationsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      type: { type: 'string', enum: notificationTypeEnum },
      priority: { type: 'string', enum: notificationPriorityEnum },
      isRead: { type: 'boolean' },
      userId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: notificationResponseSchema,
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const deleteNotificationSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const markAsReadSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: notificationResponseSchema,
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const markAllAsReadSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        count: { type: 'number' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getByUserSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      isRead: { type: 'boolean' },
      type: { type: 'string', enum: notificationTypeEnum },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: notificationResponseSchema,
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getUnreadSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: notificationResponseSchema,
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getByTypeSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['type'],
    properties: {
      type: { type: 'string', enum: notificationTypeEnum },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: notificationResponseSchema,
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getByPrioritySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['priority'],
    properties: {
      priority: { type: 'string', enum: notificationPriorityEnum },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: notificationResponseSchema,
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getRecentSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      days: { type: 'number', minimum: 1, maximum: 365, default: 7 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: notificationResponseSchema,
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getStatsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        unread: { type: 'number' },
        read: { type: 'number' },
        byType: { type: 'object' },
        byPriority: { type: 'object' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const searchSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['q'],
    properties: {
      q: { type: 'string', minLength: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: notificationResponseSchema,
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const NotificationSchemas = {
  create: createNotificationSchema,
  update: updateNotificationSchema,
  get: getNotificationSchema,
  delete: deleteNotificationSchema,
  list: listNotificationsSchema,
  markAsRead: markAsReadSchema,
  markAllAsRead: markAllAsReadSchema,
  getByUser: getByUserSchema,
  getUnread: getUnreadSchema,
  getByType: getByTypeSchema,
  getByPriority: getByPrioritySchema,
  getRecent: getRecentSchema,
  getStats: getStatsSchema,
  search: searchSchema,
}
