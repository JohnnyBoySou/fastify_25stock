import { db } from '@/plugins/prisma'

export const StoreQueries = {
  async getById(id: string) {
    const store = await db.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            referencePrice: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
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
