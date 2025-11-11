import { db } from '@/plugins/prisma'

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

    if (!store) {
      throw new Error('Store not found')
    }

    return store
  },
}
