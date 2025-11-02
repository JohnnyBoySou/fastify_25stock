import { db } from '@/plugins/prisma'
import { TriggerHandler } from '@/services/workflow-engine/trigger-handler.service'

export const MovementCommands = {
  async create(data: {
    type: 'INBOUND' | 'OUTBOUND' | 'LOSS'
    origin?:
      | 'PURCHASE'
      | 'SALE'
      | 'RETURN'
      | 'SUPPLIER_RETURN'
      | 'ADJUSTMENT'
      | 'TRANSFER'
      | 'INVENTORY'
      | 'DAMAGE'
      | 'EXPIRATION'
      | 'OTHER'
    referenceCode?: string
    quantity: number
    storeId: string // Agora é obrigatório, vem do middleware
    productId: string
    supplierId?: string
    batch?: string
    expiration?: string
    price?: number
    note?: string
    userId?: string
  }) {
    console.log('MovementCommands.create called with:', data)

    const storeId = data.storeId // Agora sempre vem do middleware
    console.log('Using storeId:', storeId)

    // Verificar se o produto existe na loja
    const product = await db.product.findFirst({
      where: {
        id: data.productId,
        storeId: storeId,
        status: true,
      },
    })

    console.log('Product found:', product)

    if (!product) {
      throw new Error('Product not found in this store')
    }

    // Verificar se o fornecedor existe (se fornecido)
    if (data.supplierId) {
      const supplier = await db.supplier.findUnique({
        where: {
          id: data.supplierId,
          status: true,
        },
      })

      if (!supplier) {
        throw new Error('Supplier not found or inactive')
      }
    }

    // Calcular o saldo antes e após a movimentação
    console.log('Calculating current stock for product:', data.productId, 'store:', storeId)
    const currentStock = await MovementCommands.getCurrentStock(data.productId, storeId)
    console.log('Current stock:', currentStock)

    const balanceBefore = currentStock
    let balanceAfter = currentStock

    if (data.type === 'INBOUND') {
      balanceAfter = currentStock + data.quantity
    } else if (data.type === 'OUTBOUND' || data.type === 'LOSS') {
      if (currentStock < data.quantity) {
        throw new Error('Insufficient stock for this movement')
      }
      balanceAfter = currentStock - data.quantity
    }

    console.log('Balance before:', balanceBefore, 'Balance after movement:', balanceAfter)

    // Converter data de expiração no formato YYYY-MM-DD para DateTime
    let expirationDate: Date | undefined = undefined
    if (data.expiration) {
      expirationDate = new Date(`${data.expiration}T00:00:00.000Z`) // Adiciona horário para converter corretamente
    }

    // Calcular totalValue (quantity * price)
    const totalValue = data.price ? data.quantity * data.price : undefined

    // Criar a movimentação
    console.log('Creating movement in database...')
    const movement = await db.movement.create({
      data: {
        type: data.type as any,
        origin: data.origin as any,
        referenceCode: data.referenceCode,
        quantity: data.quantity,
        storeId: storeId,
        productId: data.productId,
        supplierId: data.supplierId,
        batch: data.batch,
        expiration: expirationDate,
        price: data.price,
        totalValue: totalValue,
        note: data.note,
        userId: data.userId,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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

    console.log('Movement created successfully:', movement)

    // Disparar workflows que respondem a movimentações
    try {
      await TriggerHandler.handleMovementCreated(movement)
    } catch (error) {
      console.error('Error triggering workflows for movement:', error)
      // Não falhar a criação da movimentação se houver erro nos workflows
    }

    return movement
  },

  async update(
    id: string,
    data: {
      type?: 'INBOUND' | 'OUTBOUND' | 'LOSS'
      origin?:
        | 'PURCHASE'
        | 'SALE'
        | 'RETURN'
        | 'SUPPLIER_RETURN'
        | 'ADJUSTMENT'
        | 'TRANSFER'
        | 'INVENTORY'
        | 'DAMAGE'
        | 'EXPIRATION'
        | 'OTHER'
      referenceCode?: string
      quantity?: number
      supplierId?: string
      batch?: string
      expiration?: string
      price?: number
      note?: string
    }
  ) {
    const existingMovement = await db.movement.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })

    if (!existingMovement) {
      throw new Error('Movement not found')
    }

    // Se a quantidade ou tipo mudou, recalcular o saldo
    if (data.quantity !== undefined || data.type !== undefined) {
      const currentStock = await MovementCommands.getCurrentStock(
        existingMovement.productId,
        existingMovement.storeId
      )

      // Reverter a movimentação anterior
      let revertedStock = currentStock
      if (existingMovement.type === 'INBOUND') {
        revertedStock = currentStock - existingMovement.quantity
      } else if (existingMovement.type === 'OUTBOUND' || existingMovement.type === 'LOSS') {
        revertedStock = currentStock + existingMovement.quantity
      }

      // Aplicar a nova movimentação
      const newQuantity = data.quantity ?? existingMovement.quantity
      const newType = data.type ?? existingMovement.type
      const newBalanceBefore = revertedStock
      let newBalanceAfter = revertedStock

      if (newType === 'INBOUND') {
        newBalanceAfter = revertedStock + newQuantity
      } else if (newType === 'OUTBOUND' || newType === 'LOSS') {
        if (revertedStock < newQuantity) {
          throw new Error('Insufficient stock for this movement')
        }
        newBalanceAfter = revertedStock - newQuantity
      }
      ;(data as any).balanceBefore = newBalanceBefore
      ;(data as any).balanceAfter = newBalanceAfter
    }

    // Recalcular totalValue se price ou quantity mudaram
    if (data.price !== undefined || data.quantity !== undefined) {
      const newPrice = data.price ?? existingMovement.price
      const newQuantity = data.quantity ?? existingMovement.quantity
      ;(data as any).totalValue = newPrice ? Number(newPrice) * newQuantity : null
    }

    // Converter data de expiração no formato YYYY-MM-DD para DateTime
    let expirationDate = undefined
    if (data.expiration) {
      expirationDate = new Date(`${data.expiration}T00:00:00.000Z`) // Adiciona horário para converter corretamente
    }

    const updateData = {
      ...data,
      expiration: expirationDate,
      updatedAt: new Date(),
    }

    return await db.movement.update({
      where: { id },
      data: updateData,
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
  },

  async delete(id: string) {
    const movement = await db.movement.findUnique({
      where: { id },
    })

    if (!movement) {
      throw new Error('Movement not found')
    }

    // Verificar se é possível reverter o estoque
    const currentStock = await MovementCommands.getCurrentStock(
      movement.productId,
      movement.storeId
    )

    if (movement.type === 'OUTBOUND' || movement.type === 'LOSS') {
      // Se for saída ou perda, verificar se há estoque suficiente para reverter
      if (currentStock < movement.quantity) {
        throw new Error('Cannot delete movement: insufficient stock to revert')
      }
    }

    await db.movement.delete({
      where: { id },
    })

    return { success: true }
  },

  async getCurrentStock(productId: string, storeId: string): Promise<number> {
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

  async recalculateStock(productId: string, storeId: string) {
    const movements = await db.movement.findMany({
      where: {
        productId,
        storeId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    let currentStock = 0
    const updatedMovements = []

    for (const movement of movements) {
      const balanceBefore = currentStock

      if (movement.type === 'INBOUND') {
        currentStock += movement.quantity
      } else if (movement.type === 'OUTBOUND' || movement.type === 'LOSS') {
        currentStock -= movement.quantity
      }

      // Atualizar o balanceBefore e balanceAfter se necessário
      if (movement.balanceBefore !== balanceBefore || movement.balanceAfter !== currentStock) {
        updatedMovements.push({
          id: movement.id,
          balanceBefore: balanceBefore,
          balanceAfter: currentStock,
        })
      }
    }

    // Atualizar os balanceBefore e balanceAfter em lote
    if (updatedMovements.length > 0) {
      await db.$transaction(
        updatedMovements.map((movement) =>
          db.movement.update({
            where: { id: movement.id },
            data: {
              balanceBefore: movement.balanceBefore,
              balanceAfter: movement.balanceAfter,
            },
          })
        )
      )
    }

    return currentStock
  },

  // === FUNÇÕES ADICIONAIS DE MOVIMENTAÇÃO ===
  async createBulk(
    movements: Array<{
      type: 'INBOUND' | 'OUTBOUND' | 'LOSS'
      origin?:
        | 'PURCHASE'
        | 'SALE'
        | 'RETURN'
        | 'SUPPLIER_RETURN'
        | 'ADJUSTMENT'
        | 'TRANSFER'
        | 'INVENTORY'
        | 'DAMAGE'
        | 'EXPIRATION'
        | 'OTHER'
      referenceCode?: string
      quantity: number
      storeId: string
      productId: string
      supplierId?: string
      batch?: string
      expiration?: string
      price?: number
      note?: string
    }>,
    userId?: string
  ) {
    const results = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < movements.length; i++) {
      try {
        const movement = await MovementCommands.create({
          ...movements[i],
          userId,
        })

        results.push({
          index: i,
          success: true,
          movement,
        })
        successCount++
      } catch (error: any) {
        results.push({
          index: i,
          success: false,
          error: error.message,
        })
        failedCount++
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    }
  },

  async verify(id: string, verified: boolean, note?: string, userId?: string) {
    const movement = await db.movement.findUnique({
      where: { id },
    })

    if (!movement) {
      throw new Error('Movement not found')
    }

    return await db.movement.update({
      where: { id },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
        verifiedBy: verified ? userId : null,
        verificationNote: note,
        updatedAt: new Date(),
      },
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
  },

  async cancel(id: string, reason: string, userId?: string) {
    const movement = await db.movement.findUnique({
      where: { id },
    })

    if (!movement) {
      throw new Error('Movement not found')
    }

    if (movement.cancelled) {
      throw new Error('Movement already cancelled')
    }

    // Verificar se é possível cancelar (reverter estoque)
    const currentStock = await MovementCommands.getCurrentStock(
      movement.productId,
      movement.storeId
    )

    if (movement.type === 'OUTBOUND' || movement.type === 'LOSS') {
      // Se for saída ou perda, verificar se há estoque suficiente para reverter
      if (currentStock < movement.quantity) {
        throw new Error('Cannot cancel movement: insufficient stock to revert')
      }
    }

    return await db.movement.update({
      where: { id },
      data: {
        cancelled: true,
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
        updatedAt: new Date(),
      },
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
  },

  async getMovementReport(params: {
    storeId?: string
    productId?: string
    supplierId?: string
    type?: 'INBOUND' | 'OUTBOUND' | 'LOSS'
    origin?:
      | 'PURCHASE'
      | 'SALE'
      | 'RETURN'
      | 'SUPPLIER_RETURN'
      | 'ADJUSTMENT'
      | 'TRANSFER'
      | 'INVENTORY'
      | 'DAMAGE'
      | 'EXPIRATION'
      | 'OTHER'
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
  }) {
    const {
      storeId,
      productId,
      supplierId,
      type,
      origin,
      startDate,
      endDate,
      groupBy = 'day',
    } = params

    // Construir filtros
    const where: any = {}

    if (storeId) where.storeId = storeId
    if (productId) where.productId = productId
    if (supplierId) where.supplierId = supplierId
    if (type) where.type = type
    if (origin) where.origin = origin
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Buscar movimentações
    const movements = await db.movement.findMany({
      where,
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
          },
        },
        supplier: {
          select: {
            id: true,
            corporateName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Agrupar por período
    const groupedData = new Map<
      string,
      {
        movements: number
        value: number
        inbound: number
        outbound: number
        loss: number
      }
    >()

    for (const movement of movements) {
      let dateKey: string
      const date = new Date(movement.createdAt)

      switch (groupBy) {
        case 'day':
          dateKey = date.toISOString().split('T')[0]
          break
        case 'week': {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          dateKey = weekStart.toISOString().split('T')[0]
          break
        }
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          dateKey = String(date.getFullYear())
          break
        default:
          dateKey = date.toISOString().split('T')[0]
      }

      if (!groupedData.has(dateKey)) {
        groupedData.set(dateKey, {
          movements: 0,
          value: 0,
          inbound: 0,
          outbound: 0,
          loss: 0,
        })
      }

      const groupData = groupedData.get(dateKey)
      if (groupData) {
        groupData.movements++
        groupData.value += Number(movement.totalValue) || Number(movement.price) || 0

        if (movement.type === 'INBOUND') {
          groupData.inbound += movement.quantity
        } else if (movement.type === 'OUTBOUND') {
          groupData.outbound += movement.quantity
        } else if (movement.type === 'LOSS') {
          groupData.loss += movement.quantity
        }
      }
    }

    // Converter para array
    const data = Array.from(groupedData.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }))

    // Estatísticas por tipo
    const byType = {
      INBOUND: { count: 0, value: 0, quantity: 0 },
      OUTBOUND: { count: 0, value: 0, quantity: 0 },
      LOSS: { count: 0, value: 0, quantity: 0 },
    }

    for (const movement of movements) {
      const typeData = byType[movement.type]
      typeData.count++
      typeData.value += Number(movement.totalValue) || Number(movement.price) || 0
      typeData.quantity += movement.quantity
    }

    // Estatísticas por loja
    const storeMap = new Map<string, { movements: number; value: number }>()
    for (const movement of movements) {
      const storeId = movement.storeId
      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, { movements: 0, value: 0 })
      }
      const storeData = storeMap.get(storeId)
      if (storeData) {
        storeData.movements++
        storeData.value += Number(movement.totalValue) || Number(movement.price) || 0
      }
    }

    const byStore = Array.from(storeMap.entries()).map(([storeId, stats]) => {
      const store = movements.find((m) => m.storeId === storeId)?.store
      return {
        storeId,
        storeName: store?.name || 'Unknown',
        ...stats,
      }
    })

    // Estatísticas por produto
    const productMap = new Map<string, { movements: number; quantity: number }>()
    for (const movement of movements) {
      const productId = movement.productId
      if (!productMap.has(productId)) {
        productMap.set(productId, { movements: 0, quantity: 0 })
      }
      const productData = productMap.get(productId)
      if (productData) {
        productData.movements++
        productData.quantity += movement.quantity
      }
    }

    const byProduct = Array.from(productMap.entries()).map(([productId, stats]) => {
      const product = movements.find((m) => m.productId === productId)?.product
      return {
        productId,
        productName: product?.name || 'Unknown',
        ...stats,
      }
    })

    // Estatísticas por fornecedor
    const supplierMap = new Map<string, { movements: number; value: number }>()
    for (const movement of movements) {
      if (movement.supplierId) {
        const supplierId = movement.supplierId
        if (!supplierMap.has(supplierId)) {
          supplierMap.set(supplierId, { movements: 0, value: 0 })
        }
        const supplierData = supplierMap.get(supplierId)
        if (supplierData) {
          supplierData.movements++
          supplierData.value += Number(movement.totalValue) || Number(movement.price) || 0
        }
      }
    }

    const bySupplier = Array.from(supplierMap.entries()).map(([supplierId, stats]) => {
      const supplier = movements.find((m) => m.supplierId === supplierId)?.supplier
      return {
        supplierId,
        supplierName: supplier?.corporateName || 'Unknown',
        ...stats,
      }
    })

    return {
      summary: {
        totalMovements: movements.length,
        totalValue: movements.reduce(
          (sum, m) => sum + (Number(m.totalValue) || Number(m.price) || 0),
          0
        ),
        period: {
          startDate:
            startDate ||
            new Date(Math.min(...movements.map((m) => m.createdAt.getTime())))
              .toISOString()
              .split('T')[0],
          endDate:
            endDate ||
            new Date(Math.max(...movements.map((m) => m.createdAt.getTime())))
              .toISOString()
              .split('T')[0],
        },
      },
      data,
      byType,
      byStore,
      byProduct,
      bySupplier,
    }
  },
}
