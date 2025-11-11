import { db } from '@/plugins/prisma'

export const NotificationCommands = {
  async create(data: {
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
    expiresAt?: Date
  }) {
    return await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        priority: data.priority || 'MEDIUM',
        data: data.data,
        actionUrl: data.actionUrl,
        expiresAt: data.expiresAt,
      },
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

  async update(
    id: string,
    data: {
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
      expiresAt?: Date
    }
  ) {
    return await db.notification.update({
      where: { id },
      data,
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

  async delete(id: string) {
    return await db.notification.delete({
      where: { id },
    })
  },

  async markAsRead(id: string) {
    return await db.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
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

  async markAsUnread(id: string) {
    return await db.notification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      },
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

  async markAllAsRead(userId: string) {
    return await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  },

  async deleteExpired() {
    return await db.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  },

  async deleteByUser(userId: string) {
    return await db.notification.deleteMany({
      where: { userId },
    })
  },

  async markStockAlertsAsRead(userId: string, storeId?: string) {
    const whereCondition: any = {
      userId,
      isRead: false,
      type: 'STOCK_ALERT',
    }

    if (storeId) {
      whereCondition.data = {
        path: ['storeId'],
        equals: storeId,
      }
    }

    return await db.notification.updateMany({
      where: whereCondition,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  },
}
