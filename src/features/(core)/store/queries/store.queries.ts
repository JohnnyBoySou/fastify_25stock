import { db } from '@/plugins/prisma'
import { PolarQueries } from '../../../polar/queries/polar.queries'

export const StoreQueries = {
  async getById(id: string) {
    const store = await db.store.findUnique({
      where: { id },
      include: {
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodEnd: true,
            trialEndsAt: true,
            polarCustomerId: true,
            polarSubscriptionId: true,
            polarProductId: true,
            polarPlanName: true,
            priceAmount: true,
            priceInterval: true,
            currency: true,
            createdAt: true,

            updatedAt: true,
            invoices: {
              select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (store?.subscription?.polarProductId) {
      const plan = await PolarQueries.getPlanById(store.subscription.polarProductId)
      return {
        ...store,
        subscription: {
          ...store.subscription,
          plan,
        },
      }
    }

    return store
  },

  async getStats(storeId: string) {
    const stats = await db.store.findUnique({
      where: { id: storeId },
      select: {
        _count: {
          select: {
            users: true,
            products: true,
            categories: true,
            suppliers: true,
            movements: true,
            roadmaps: true,
            quotes: true,
            documents: true,
            flows: true,
            crmClients: true,
          },
        },
      },
    })

    return {
      users: stats?._count?.users || 0,
      products: stats?._count?.products || 0,
      categories: stats?._count?.categories || 0,
      suppliers: stats?._count?.suppliers || 0,
      movements: stats?._count?.movements || 0,
      roadmaps: stats?._count?.roadmaps || 0,
      contacts: stats?._count?.crmClients || 0,
      quotes: stats?._count?.quotes || 0,
      documents: stats?._count?.documents || 0,
      flows: stats?._count?.flows || 0,
    }
  },
}
