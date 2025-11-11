import { db } from '@/plugins/prisma'
import type { SubscriptionInterval } from '../subscription.interfaces'

export const SubscriptionCommands = {
  async create(data: {
    storeId: string
    description?: string
    price: number
    interval: SubscriptionInterval
    features?: any
  }) {
    // Verificar se já existe um plano com o mesmo nome
    const existingSubscription = await db.subscription.findFirst({
      where: { storeId: data.storeId },
    })

    if (existingSubscription) {
      throw new Error('Subscription with this store already exists')
    }

    return await db.subscription.create({
      data: {
        ...data,
        priceInterval: data.interval,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      storeId?: string
      description?: string
      price?: number
      interval?: SubscriptionInterval
      features?: any
    }
  ) {
    // Verificar se o plano existe
    const existingSubscription = await db.subscription.findUnique({
      where: { id },
    })

    if (!existingSubscription) {
      throw new Error('Plan not found')
    }

    return await db.subscription.update({
      where: { id },
      data: {
        ...data,
        ...(data.interval && { priceInterval: data.interval as SubscriptionInterval }),
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    // Verificar se o plano existe
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        store: {
          select: { id: true },
        },
      },
    })

    if (!subscription) {
      throw new Error('Plan not found')
    }

    return await db.subscription.delete({
      where: { id },
    })
  },

  async forceDelete(id: string) {
    // Verificar se o plano existe
    const subscription = await db.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new Error('Plan not found')
    }

    await db.invoice.deleteMany({
      where: { subscriptionId: id },
    })

    return await db.subscription.delete({
      where: { id },
    })
  },

  async updateStatus(id: string, active: boolean) {
    // Verificar se a subscription existe
    const subscription = await db.subscription.findUnique({
      where: { id },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    return await db.subscription.update({
      where: { id },
      data: {
        status: active ? 'ACTIVE' : 'INACTIVE',
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    })
  },
}
