import { db } from '@/plugins/prisma'

export const NotificationQueries = {
  async getById(id: string) {
    return await db.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async list(params: {
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
  }) {
    const { page = 1, limit = 10, search, type, priority, isRead, userId } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    if (priority) {
      where.priority = priority
    }

    if (isRead !== undefined) {
      where.isRead = isRead
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter out expired notifications
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]

    const [items, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.notification.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByUser(
    userId: string,
    params?: {
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
  ) {
    return await NotificationQueries.list({
      userId,
      ...params,
    })
  },

  async getUnread(userId: string, limit?: number) {
    return await db.notification.findMany({
      where: {
        userId,
        isRead: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: limit || 10,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async getByType(
    type:
      | 'INFO'
      | 'SUCCESS'
      | 'WARNING'
      | 'ERROR'
      | 'STOCK_ALERT'
      | 'MOVEMENT'
      | 'PERMISSION'
      | 'SYSTEM',
    limit?: number
  ) {
    return await db.notification.findMany({
      where: {
        type,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async getByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', limit?: number) {
    return await db.notification.findMany({
      where: {
        priority,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async search(term: string, limit = 10) {
    return await db.notification.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { message: { contains: term, mode: 'insensitive' } },
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async getStats(userId?: string) {
    const where = userId ? { userId } : {}

    const [total, unread, byType, byPriority] = await Promise.all([
      db.notification.count({ where }),
      db.notification.count({
        where: {
          ...where,
          isRead: false,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      }),
      db.notification.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      db.notification.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
    ])

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count
          return acc
        },
        {} as Record<string, number>
      ),
      byPriority: byPriority.reduce(
        (acc, item) => {
          acc[item.priority] = item._count
          return acc
        },
        {} as Record<string, number>
      ),
    }
  },

  async getRecent(userId: string, days = 7, limit = 20) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return await db.notification.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  // === QUERIES ESPECÍFICAS PARA ALERTAS DE ESTOQUE ===
  async getStockAlerts(params: {
    userId?: string
    storeId?: string
    isRead?: boolean
    limit?: number
  }) {
    const { userId, storeId, isRead, limit = 20 } = params

    const where: any = {
      type: 'STOCK_ALERT',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    }

    if (userId) {
      where.userId = userId
    }

    if (isRead !== undefined) {
      where.isRead = isRead
    }

    if (storeId) {
      where.data = {
        path: ['storeId'],
        equals: storeId,
      }
    }

    return await db.notification.findMany({
      where,
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async getUnreadStockAlerts(userId: string, limit = 10) {
    return await db.notification.findMany({
      where: {
        userId,
        type: 'STOCK_ALERT',
        isRead: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },
}
