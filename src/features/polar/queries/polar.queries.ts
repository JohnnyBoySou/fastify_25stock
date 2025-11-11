import { polar } from '@/plugins/polar'
import { db } from '@/plugins/prisma'

export const PolarQueries = {
  async list({ page, limit }: { page: number; limit: number }) {
    try {
      const { result } = await polar.products.list({
        organizationId: process.env.POLAR_ORGANIZATION_ID as string,
        page,
        limit,
      })

      return {
        items: result.items,
        pagination: {
          page,
          limit,
        },
      }
    } catch (error) {
      console.error('Polar products list error:', error)
      throw new Error(`Failed to fetch products: ${error}`)
    }
  },

  async getPlanById(id: string) {
    try {
      const { result } = await polar.products.list({
        organizationId: process.env.POLAR_ORGANIZATION_ID as string,
        page: 1,
        limit: 10,
      })

      const plan = result.items.find((product: any) => product.id === id)
      return plan || null
    } catch (error) {
      console.error('Polar get plan by id error:', error)
      throw new Error(`Failed to fetch plan: ${error}`)
    }
  },

  async getFreePlan() {
    try {
      const { result } = await polar.products.list({
        organizationId: process.env.POLAR_ORGANIZATION_ID as string,
        page: 1,
        limit: 10,
      })
      console.log(result)
      const freeProduct = result.items.find((product) =>
        product.prices.some((price: any) => price.amountType === 'free')
      )

      return freeProduct || null
    } catch (error) {
      console.error('Polar get free plan error:', error)
      return null
    }
  },
}
