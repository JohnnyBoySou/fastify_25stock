import { db } from '@/plugins/prisma'

export const SubscriptionQueries = {
  async getById(id: string) {
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
            status: true,
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
          take: 5,
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
      where.priceInterval = interval
    }

    if (search) {
      where.OR = [
        { polarPlanName: { contains: search, mode: 'insensitive' } },
        {
          store: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              plan: true,
              status: true,
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
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
            status: true,
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
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
            status: true,
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
      include: {
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    if (status && plan.status !== status) {
      return {
        customers: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      }
    }

    const userWhere = {
      storeId: plan.storeId,
    }

    const [customers, total] = await Promise.all([
      db.user.findMany({
        where: userWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
      db.user.count({ where: userWhere }),
    ])

    const invoices = plan.invoices.map((invoice) => ({
      ...invoice,
      amount: Number(invoice.amount),
    }))

    return {
      customers: customers.map((customer) => ({
        id: customer.id,
        status: plan.status,
        renewalDate: plan.currentPeriodEnd,
        trialEndsAt: plan.trialEndsAt,
        createdAt: customer.createdAt,
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        subscription: {
          id: plan.id,
          name: plan.polarPlanName,
          price: plan.priceAmount ? Number(plan.priceAmount) : null,
          interval: plan.priceInterval,
        },
        invoices,
      })),
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
