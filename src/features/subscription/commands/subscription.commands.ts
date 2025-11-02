import { db } from '@/plugins/prisma'
import type { SubscriptionInterval } from '../subscription.interfaces'

export const SubscriptionCommands = {
  async create(data: {
    userId: string
    description?: string
    price: number
    interval: SubscriptionInterval
    features?: any
  }) {
    // Verificar se já existe um plano com o mesmo nome
    const existingSubscription = await db.subscription.findFirst({
      where: { userId: data.userId },
    })

    if (existingSubscription) {
      throw new Error('Subscription with this user already exists')
    }

    return await db.subscription.create({
      data: {
        ...data,
        priceInterval: data.interval,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      userId?: string
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
        user: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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
        user: {
          select: { id: true },
        },
      },
    })

    if (!subscription) {
      throw new Error('Plan not found')
    }

    // Verificar se existem customers associados
    if (subscription.user) {
      throw new Error(
        `Cannot delete subscription. It has ${subscription.user} associated customers. Please reassign or delete the customers first.`
      )
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

    // Primeiro, remover a associação de todos os customers
    await db.subscription.updateMany({
      where: { userId: id },
      data: { userId: null },
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
        user: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })
  },
}
