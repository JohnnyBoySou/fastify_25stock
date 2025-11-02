import { db } from '@/plugins/prisma'

export const MovementQueries = {
  async getById(id: string) {
    console.log('MovementQueries.getById: Searching for movement with id:', id)

    const movement = await db.movement.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            unitOfMeasure: true,
          },
        },
        supplier: {
          select: {
            id: true,
            corporateName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!movement) {
      console.log('MovementQueries.getById: Movement not found')
      return null
    }

    console.log('MovementQueries.getById: Found movement with relations:', {
      id: movement.id,
      storeId: movement.storeId,
      productId: movement.productId,
      supplierId: movement.supplierId,
      userId: movement.userId,
      store: movement.store,
      product: movement.product,
      supplier: movement.supplier,
      user: movement.user,
    })

    // Garantir que os objetos relacionados não sejam undefined
    const result = {
      ...movement,
      store: movement.store || null,
      product: movement.product || null,
      supplier: movement.supplier || null,
      user: movement.user || null,
    }

    console.log('MovementQueries.getById: Final result:', JSON.stringify(result, null, 2))

    return result
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    storeId?: string
    productId?: string
    supplierId?: string
    startDate?: string
    endDate?: string
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      storeId,
      productId,
      supplierId,
      startDate,
      endDate,
    } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (storeId) {
      where.storeId = storeId
    }

    if (productId) {
      where.productId = productId
    }

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          store: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          supplier: {
            corporateName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          batch: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          note: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    // Log para debug do primeiro item
    if (items.length > 0) {
      console.log('MovementQueries.list - Sample item:', {
        movementId: items[0].id,
        storeId: items[0].storeId,
        store: items[0].store,
        productId: items[0].productId,
        product: items[0].product,
        supplierId: items[0].supplierId,
        supplier: items[0].supplier,
        userId: items[0].userId,
        user: items[0].user,
      })
    }

    // Serializar os dados relacionados para garantir que não venham vazios
    const serializedItems = items.map((item) => {
      // Verificar se os objetos não estão vazios antes de incluir
      const serialized = {
        ...item,
        store: item.store && Object.keys(item.store).length > 0 ? item.store : null,
        product: item.product && Object.keys(item.product).length > 0 ? item.product : null,
        supplier: item.supplier && Object.keys(item.supplier).length > 0 ? item.supplier : null,
        user: item.user && Object.keys(item.user).length > 0 ? item.user : null,
      }

      // Log se algum objeto relacionado estiver vazio mas com ID
      if (item.storeId && !serialized.store) {
        console.log(`Warning: Movement ${item.id} has storeId ${item.storeId} but store is empty`)
      }
      if (item.productId && !serialized.product) {
        console.log(
          `Warning: Movement ${item.id} has productId ${item.productId} but product is empty`
        )
      }

      return serialized
    })

    return {
      items: serializedItems,
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
    storeId: string,
    params: {
      page?: number
      limit?: number
    } = {}
  ) {
    const { page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const where = {
      storeId,
      OR: [
        {
          product: {
            name: {
              contains: term,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          store: {
            name: {
              contains: term,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          supplier: {
            corporateName: {
              contains: term,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          batch: {
            contains: term,
            mode: 'insensitive' as const,
          },
        },
      ],
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByStore(
    storeId: string,
    params: {
      page?: number
      limit?: number
      type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
      startDate?: string
      endDate?: string
    }
  ) {
    const { page = 1, limit = 10, type, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = { storeId }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByProduct(
    productId: string,
    params: {
      page?: number
      limit?: number
      type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
      startDate?: string
      endDate?: string
      storeId?: string
    }
  ) {
    const { page = 1, limit = 10, type, startDate, endDate, storeId } = params
    const skip = (page - 1) * limit

    const where: any = { productId }

    if (storeId) {
      where.storeId = storeId
    }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getBySupplier(
    supplierId: string,
    params: {
      page?: number
      limit?: number
      type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
      startDate?: string
      endDate?: string
    }
  ) {
    const { page = 1, limit = 10, type, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = { supplierId }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getStockHistory(
    productId: string,
    storeId: string,
    params: {
      startDate?: string
      endDate?: string
    }
  ) {
    const { startDate, endDate } = params

    const where: any = { productId, storeId }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    return await db.movement.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        quantity: true,
        balanceAfter: true,
        createdAt: true,
        batch: true,
        price: true,
        note: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  },

  async getCurrentStock(productId: string, storeId: string) {
    const movements = await db.movement.findMany({
      where: {
        productId,
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let stock = 0
    for (const movement of movements) {
      if (movement.type === 'INBOUND') {
        stock += movement.quantity
      } else if (movement.type === 'OUTBOUND' || movement.type === 'LOSS') {
        stock -= movement.quantity
      }
    }

    return Math.max(0, stock)
  },

  async getStats() {
    const [
      total,
      inbound,
      outbound,
      loss,
      totalValue,
      averageValue,
      _byType,
      byStore,
      byProduct,
      bySupplier,
    ] = await Promise.all([
      db.movement.count(),
      db.movement.count({ where: { type: 'INBOUND' } }),
      db.movement.count({ where: { type: 'OUTBOUND' } }),
      db.movement.count({ where: { type: 'LOSS' } }),
      db.movement.aggregate({
        _sum: {
          price: true,
        },
      }),
      db.movement.aggregate({
        _avg: {
          price: true,
        },
      }),
      db.movement.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
      }),
      db.movement.groupBy({
        by: ['storeId'],
        _count: {
          id: true,
        },
        _sum: {
          price: true,
        },
      }),
      db.movement.groupBy({
        by: ['productId'],
        _count: {
          id: true,
        },
        _sum: {
          quantity: true,
        },
      }),
      db.movement.groupBy({
        by: ['supplierId'],
        _count: {
          id: true,
        },
        _sum: {
          price: true,
        },
        where: {
          supplierId: {
            not: null,
          },
        },
      }),
    ])

    // Buscar nomes das entidades relacionadas
    const storeIds = byStore.map((item) => item.storeId)
    const productIds = byProduct.map((item) => item.productId)
    const supplierIds = bySupplier.map((item) => item.supplierId).filter(Boolean)

    const [stores, products, suppliers] = await Promise.all([
      storeIds.length > 0
        ? db.store.findMany({
            where: { id: { in: storeIds } },
            select: { id: true, name: true },
          })
        : [],
      productIds.length > 0
        ? db.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          })
        : [],
      supplierIds.length > 0
        ? db.supplier.findMany({
            where: { id: { in: supplierIds } },
            select: { id: true, corporateName: true },
          })
        : [],
    ])

    const storeMap = new Map(stores.map((store) => [store.id, store.name] as [string, string]))
    const productMap = new Map(
      products.map((product) => [product.id, product.name] as [string, string])
    )
    const supplierMap = new Map(
      suppliers.map((supplier) => [supplier.id, supplier.corporateName] as [string, string])
    )

    return {
      total,
      inbound: inbound as number,
      outbound: outbound as number,
      loss: loss as number,
      totalValue: totalValue._sum.price || 0,
      averageValue: averageValue._avg.price || 0,
      byType: {
        INBOUND: inbound as number,
        OUTBOUND: outbound as number,
        LOSS: loss as number,
      },
      byStore: byStore.map((item) => ({
        storeId: item.storeId as string,
        storeName: storeMap.get(item.storeId) || 'Unknown',
        count: item._count.id,
        totalValue: item._sum.price || 0,
      })),
      byProduct: byProduct.map((item) => ({
        productId: item.productId as string,
        productName: productMap.get(item.productId) || 'Unknown',
        count: item._count.id,
        totalQuantity: item._sum.quantity || 0,
      })),
      bySupplier: bySupplier.map((item) => ({
        supplierId: item.supplierId as string,
        supplierName: supplierMap.get(item.supplierId as string) || 'Unknown',
        count: item._count.id,
        totalValue: item._sum.price || 0,
      })),
    }
  },

  async getLowStockProducts(storeId?: string) {
    const where: any = {}
    if (storeId) {
      where.storeId = storeId
    }

    const products = await db.product.findMany({
      where: {
        ...where,
        status: true,
      },
      include: {
        movements: {
          where: {
            storeId: storeId || undefined,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const lowStockProducts = []

    for (const product of products) {
      const currentStock = await MovementQueries.getCurrentStock(product.id, product.storeId)
      const alertThreshold = Math.floor((product.stockMin * product.alertPercentage) / 100)

      if (currentStock <= alertThreshold) {
        lowStockProducts.push({
          product: {
            id: product.id,
            name: product.name,
            unitOfMeasure: product.unitOfMeasure,
          },
          store: product.store,
          currentStock,
          stockMin: product.stockMin,
          stockMax: product.stockMax,
          alertThreshold,
          status: currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        })
      }
    }

    return lowStockProducts.sort((a, b) => a.currentStock - b.currentStock)
  },

  // === FUNÇÕES ADICIONAIS DE MOVIMENTAÇÃO ===
  async getMovementReport(params: {
    storeId?: string
    productId?: string
    supplierId?: string
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
  }) {
    // Implementação básica do relatório de movimentação
    const { storeId, productId, supplierId, type, startDate, endDate } = params

    const where: any = {}
    if (storeId) where.storeId = storeId
    if (productId) where.productId = productId
    if (supplierId) where.supplierId = supplierId
    if (type) where.type = type
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const movements = await db.movement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        store: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, unitOfMeasure: true } },
        supplier: { select: { id: true, corporateName: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return {
      movements,
      summary: {
        total: movements.length,
        totalValue: movements.reduce((sum, m) => sum + (Number(m.price) || 0), 0),
        byType: movements.reduce(
          (acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      },
    }
  },

  async getVerifiedMovements(params: {
    page?: number
    limit?: number
    storeId?: string
    verified?: boolean
    startDate?: string
    endDate?: string
  }) {
    const { page = 1, limit = 10, storeId, verified, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (storeId) where.storeId = storeId
    if (verified !== undefined) where.verified = verified
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getCancelledMovements(params: {
    page?: number
    limit?: number
    storeId?: string
    startDate?: string
    endDate?: string
  }) {
    const { page = 1, limit = 10, storeId, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = { cancelled: true }

    if (storeId) where.storeId = storeId
    if (startDate || endDate) {
      where.cancelledAt = {}
      if (startDate) where.cancelledAt.gte = new Date(startDate)
      if (endDate) where.cancelledAt.lte = new Date(endDate)
    }

    const [items, total] = await Promise.all([
      db.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { cancelledAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          supplier: {
            select: {
              id: true,
              corporateName: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.movement.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getMovementAnalytics(params: {
    storeId?: string
    productId?: string
    supplierId?: string
    startDate?: string
    endDate?: string
  }) {
    const { storeId, productId, supplierId, startDate, endDate } = params

    const where: any = {}

    if (storeId) where.storeId = storeId
    if (productId) where.productId = productId
    if (supplierId) where.supplierId = supplierId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [
      totalMovements,
      totalValue,
      averageValue,
      byType,
      byMonth,
      byStore,
      byProduct,
      bySupplier,
      verifiedCount,
      cancelledCount,
    ] = await Promise.all([
      db.movement.count({ where }),
      db.movement.aggregate({
        where,
        _sum: { price: true },
      }),
      db.movement.aggregate({
        where,
        _avg: { price: true },
      }),
      db.movement.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
        _sum: { quantity: true, price: true },
      }),
      db.movement.groupBy({
        by: ['createdAt'],
        where,
        _count: { id: true },
        _sum: { price: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.movement.groupBy({
        by: ['storeId'],
        where,
        _count: { id: true },
        _sum: { price: true },
      }),
      db.movement.groupBy({
        by: ['productId'],
        where,
        _count: { id: true },
        _sum: { quantity: true, price: true },
      }),
      db.movement.groupBy({
        by: ['supplierId'],
        where: { ...where, supplierId: { not: null } },
        _count: { id: true },
        _sum: { price: true },
      }),
      db.movement.count({ where: { ...where, verified: true } }),
      db.movement.count({ where: { ...where, cancelled: true } }),
    ])

    // Buscar nomes das entidades
    const storeIds = byStore.map((item) => item.storeId)
    const productIds = byProduct.map((item) => item.productId)
    const supplierIds = bySupplier.map((item) => item.supplierId).filter(Boolean)

    const [stores, products, suppliers] = await Promise.all([
      storeIds.length > 0
        ? db.store.findMany({
            where: { id: { in: storeIds } },
            select: { id: true, name: true },
          })
        : [],
      productIds.length > 0
        ? db.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          })
        : [],
      supplierIds.length > 0
        ? db.supplier.findMany({
            where: { id: { in: supplierIds } },
            select: { id: true, corporateName: true },
          })
        : [],
    ])

    const storeMap = new Map(stores.map((store) => [store.id, store.name] as [string, string]))
    const productMap = new Map(
      products.map(
        (product: { id: string; name: string }) => [product.id, product.name] as [string, string]
      )
    )
    const supplierMap = new Map(
      suppliers.map((supplier) => [supplier.id, supplier.corporateName] as [string, string])
    )

    return {
      summary: {
        totalMovements,
        totalValue: totalValue._sum.price || 0,
        averageValue: averageValue._avg.price || 0,
        verifiedCount,
        cancelledCount,
        verificationRate: totalMovements > 0 ? (verifiedCount / totalMovements) * 100 : 0,
        cancellationRate: totalMovements > 0 ? (cancelledCount / totalMovements) * 100 : 0,
      },
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count.id,
        quantity: item._sum.quantity || 0,
        value: item._sum.price || 0,
      })),
      byMonth: byMonth.map((item) => ({
        month: item.createdAt.toISOString().substring(0, 7),
        count: item._count.id,
        value: item._sum.price || 0,
      })),
      byStore: byStore.map((item) => ({
        storeId: item.storeId,
        storeName: storeMap.get(item.storeId) || 'Unknown',
        count: item._count.id,
        value: item._sum.price || 0,
      })),
      byProduct: byProduct.map((item) => ({
        productId: item.productId,
        productName: productMap.get(item.productId) || 'Unknown',
        count: item._count.id,
        quantity: item._sum.quantity || 0,
        value: item._sum.price || 0,
      })),
      bySupplier: bySupplier.map((item) => ({
        supplierId: item.supplierId,
        supplierName: supplierMap.get(item.supplierId as string) || 'Unknown',
        count: item._count.id,
        value: item._sum.price || 0,
      })),
    }
  },

  async getProductSummary(
    productId: string,
    params: {
      startDate?: string
      endDate?: string
      storeId?: string
    }
  ) {
    const { startDate, endDate, storeId } = params

    // Buscar informações do produto
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        unitOfMeasure: true,
        stockMin: true,
        stockMax: true,
        alertPercentage: true,
      },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Construir filtros para as movimentações
    const where: any = { productId }

    if (storeId) {
      where.storeId = storeId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Buscar todas as movimentações do produto
    const movements = await db.movement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            corporateName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calcular estatísticas
    const totalMovements = movements.length
    const inboundMovements = movements.filter((m) => m.type === 'INBOUND')
    const outboundMovements = movements.filter((m) => m.type === 'OUTBOUND')
    const lossMovements = movements.filter((m) => m.type === 'LOSS')

    const totalInbound = inboundMovements.reduce((sum, m) => sum + m.quantity, 0)
    const totalOutbound = outboundMovements.reduce((sum, m) => sum + m.quantity, 0)
    const totalLoss = lossMovements.reduce((sum, m) => sum + m.quantity, 0)

    const totalValue = movements.reduce((sum, m) => sum + (Number(m.price) || 0), 0)
    const averageValue = totalMovements > 0 ? totalValue / totalMovements : 0

    // Calcular estoque atual por loja
    const stores = [...new Set(movements.map((m) => m.storeId))]
    const currentStockByStore = await Promise.all(
      stores.map(async (storeId) => {
        const currentStock = await MovementQueries.getCurrentStock(productId, storeId as string)
        const store = movements.find((m) => m.storeId === storeId)?.store
        return {
          storeId,
          storeName: store?.name || 'Unknown',
          currentStock,
        }
      })
    )

    return {
      product: {
        id: product.id,
        name: product.name,
        unitOfMeasure: product.unitOfMeasure,
        stockMin: product.stockMin,
        stockMax: product.stockMax,
        alertPercentage: product.alertPercentage,
      },
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
        storeId: storeId || null,
      },
      statistics: {
        totalMovements,
        inbound: {
          count: inboundMovements.length,
          quantity: totalInbound,
        },
        saida: {
          count: outboundMovements.length,
          quantity: totalOutbound,
        },
        perda: {
          count: lossMovements.length,
          quantity: totalLoss,
        },
        totalValue,
        averageValue,
      },
      currentStockByStore,
      recentMovements: movements.slice(0, 10).map((m) => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        price: m.price,
        batch: m.batch,
        createdAt: m.createdAt,
        store: m.store,
        supplier: m.supplier,
        user: m.user,
      })),
    }
  },
}
