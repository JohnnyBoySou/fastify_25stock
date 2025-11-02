import { db } from '@/plugins/prisma'

// Função auxiliar para calcular o estoque atual de um produto
async function calculateCurrentStock(productId: string): Promise<number> {
  const movements = await db.movement.findMany({
    where: { productId },
    select: {
      type: true,
      quantity: true,
    },
  })

  let currentStock = 0
  for (const movement of movements) {
    if (movement.type === 'INBOUND') {
      currentStock += movement.quantity
    } else {
      currentStock -= movement.quantity
    }
  }

  return currentStock
}

export const ProductQueries = {
  async getById(id: string, storeId: string) {
    const product = await db.product.findUnique({
      where: { id, storeId },
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                code: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            corporateName: true,
            cnpj: true,
            tradeName: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            cnpj: true,
          },
        },
      },
    })

    if (!product) {
      return null
    }

    // Calcular estoque atual
    const currentStock = await calculateCurrentStock(product.id)

    // Transformar o formato das categorias
    const transformedProduct = {
      ...product,
      categories: product.categories.map((pc) => pc.category),
      currentStock,
    }

    return transformedProduct
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
    categoryIds?: string[]
    supplierId?: string
    storeId?: string
  }) {
    const { page = 1, limit = 10, search, status, categoryIds, supplierId, storeId } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (status !== undefined) {
      where.status = status
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      }
    }

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (storeId) {
      where.storeId = storeId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  code: true,
                  color: true,
                  icon: true,
                },
              },
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
              cnpj: true,
              tradeName: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              cnpj: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ])

    // Calcular estoque atual para todos os produtos
    const itemsWithStock = await Promise.all(
      products.map(async (product) => {
        const currentStock = await calculateCurrentStock(product.id)
        return {
          ...product,
          categories: product.categories.map((pc) => pc.category),
          currentStock,
        }
      })
    )

    return {
      items: itemsWithStock,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async search(
    term: string,
    params: {
      page?: number
      limit?: number
      storeId?: string
    } = {}
  ) {
    const { page = 1, limit = 10, storeId } = params
    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { categories: { some: { category: { name: { contains: term, mode: 'insensitive' } } } } },
        { supplier: { corporateName: { contains: term, mode: 'insensitive' } } },
        { supplier: { tradeName: { contains: term, mode: 'insensitive' } } },
      ],
    }

    if (storeId) {
      where.storeId = storeId
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  code: true,
                  color: true,
                  icon: true,
                },
              },
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
              cnpj: true,
              tradeName: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              cnpj: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ])

    // Calcular estoque atual para todos os produtos
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const currentStock = await calculateCurrentStock(product.id)
        return {
          ...product,
          categories: product.categories.map((pc) => pc.category),
          currentStock,
        }
      })
    )

    return {
      items: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getActive(storeId: string) {
    const products = await db.product.findMany({
      where: {
        status: true,
        storeId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                code: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            corporateName: true,
            cnpj: true,
            tradeName: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            cnpj: true,
          },
        },
      },
    })

    // Calcular estoque atual para todos os produtos
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const currentStock = await calculateCurrentStock(product.id)
        return {
          ...product,
          categories: product.categories.map((pc) => pc.category),
          currentStock,
        }
      })
    )

    return productsWithStock
  },

  async getStats(storeId: string) {
    const [total, active, inactive] = await Promise.all([
      db.product.count({ where: { storeId } }),
      db.product.count({ where: { status: true, storeId } }),
      db.product.count({ where: { status: false, storeId } }),
    ])

    return {
      total,
      active,
      inactive,
    }
  },
}
