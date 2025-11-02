import { db } from '@/plugins/prisma'

export const SubscriptionQueries = {
  async getById(id: string) {
    const subscription = await db.subscription.findUnique({
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

    if (!subscription) {
      return null
    }

    return {
      ...subscription,
    }
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    interval?: 'MONTHLY' | 'YEARLY'
  }) {
    const { page = 1, limit = 10, search, interval } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (interval) {
      where.interval = interval
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
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
      db.subscription.count({ where }),
    ])

    const itemsWithCount = subscriptions.map((subscription) => ({
      ...subscription,
    }))

    return {
      items: itemsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getActive() {
    const subscriptions = await db.subscription.findMany({
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

    return subscriptions.map((subscription) => ({
      ...subscription,
    }))
  },

  async compare(planIds: string[]) {
    if (!planIds || planIds.length === 0) {
      throw new Error('At least one plan ID is required for comparison')
    }

    const subscriptions = await db.subscription.findMany({
      where: { id: { in: planIds } },
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

    if (subscriptions.length === 0) {
      throw new Error('No plans found for comparison')
    }

    return subscriptions
  },

  async getCustomers(
    planId: string,
    params: {
      page?: number
      limit?: number
      status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIAL'
    }
  ) {
    const { page = 1, limit = 10, status } = params
    const skip = (page - 1) * limit

    // Verificar se o plano existe
    const plan = await db.subscription.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    const where: any = {
      userId: planId,
    }

    if (status) {
      where.status = status
    }

    const [customers, total] = await Promise.all([
      db.subscription.findMany({
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
          invoices: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5, // Últimas 5 faturas
          },
        },
      }),
      db.subscription.count({ where }),
    ])

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getStats() {
    const [total, active, inactive, cancelled, trial] = await Promise.all([
      db.subscription.count(),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.subscription.count({ where: { status: 'INACTIVE' } }),
      db.subscription.count({ where: { status: 'CANCELLED' } }),
      db.subscription.count({ where: { status: 'TRIAL' } }),
    ])
    return {
      total,
      active,
      inactive,
      cancelled,
      trial,
    }
  },
}
