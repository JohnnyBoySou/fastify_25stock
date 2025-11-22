import { db } from '@/plugins/prisma'

export const ProfileQueries = {
  async single(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId, status: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })
    return user
  },

  async subscription(storeId: string) {
    const subscription = await db.subscription.findFirst({
      where: {
        storeId: storeId,
      },
      select: {
        id: true,
        polarProductId: true,
        polarPlanName: true,
        status: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        cancelledAt: true,
        renewalCount: true,
        priceAmount: true,
        priceInterval: true,
        currency: true,
      },
    })

    console.log(subscription)
    return subscription || null
  },

  async preferences(userId: string) {
    const userPreferences = await db.userPreferences.findUnique({
      where: { userId: userId },
    })
    return userPreferences || null
  },
}
