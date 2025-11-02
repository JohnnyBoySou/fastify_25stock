import { db } from '@/plugins/prisma'
import type { UnitOfMeasure } from '../product.interfaces'

export const ProductCommands = {
  async create(data: {
    name: string
    description?: string
    unitOfMeasure: UnitOfMeasure
    referencePrice: number
    categoryIds?: string[]
    supplierId?: string
    storeId: string
    stockMin: number
    stockMax: number
    alertPercentage: number
    status?: boolean
  }) {
    const { categoryIds, supplierId, storeId, ...createData } = data

    // Verificar se as categorias existem
    if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await db.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      })

      if (existingCategories.length !== categoryIds.length) {
        const foundIds = existingCategories.map((c) => c.id)
        const notFoundIds = categoryIds.filter((id) => !foundIds.includes(id))
        throw new Error(`Categories not found: ${notFoundIds.join(', ')}`)
      }
    }

    // Criar o produto primeiro
    const product = await db.product.create({
      data: {
        ...createData,
        unitOfMeasure: createData.unitOfMeasure as UnitOfMeasure,
        status: data.status ?? true,
        ...(supplierId && { supplier: { connect: { id: supplierId } } }),
        store: { connect: { id: storeId } },
      },
    })

    // Se houver categorias, criar as relações
    if (categoryIds && categoryIds.length > 0) {
      await db.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
        })),
      })
    }

    // Retornar o produto com todas as relações
    return await db.product.findUnique({
      where: { id: product.id },
      include: {
        categories: {
          include: {
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
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      unitOfMeasure?: string
      referencePrice?: number
      categoryIds?: string[]
      supplierId?: string
      storeId?: string
      stockMin?: number
      stockMax?: number
      alertPercentage?: number
      status?: boolean
    }
  ) {
    const { categoryIds, supplierId, storeId, ...updateData } = data

    // Verificar se as categorias existem (se fornecidas)
    if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await db.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      })

      if (existingCategories.length !== categoryIds.length) {
        const foundIds = existingCategories.map((c) => c.id)
        const notFoundIds = categoryIds.filter((id) => !foundIds.includes(id))
        throw new Error(`Categories not found: ${notFoundIds.join(', ')}`)
      }
    }

    // Se categoryIds for fornecido, atualizar as categorias
    let categoryUpdate = {}
    if (categoryIds !== undefined) {
      if (categoryIds.length === 0) {
        // Remover todas as categorias
        categoryUpdate = {
          categories: {
            deleteMany: {},
          },
        }
      } else {
        // Substituir todas as categorias
        categoryUpdate = {
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }
      }
    }

    return await db.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.unitOfMeasure && {
          unitOfMeasure: updateData.unitOfMeasure as UnitOfMeasure,
        }),
        ...(supplierId !== undefined && supplierId
          ? { supplier: { connect: { id: supplierId } } }
          : supplierId === null
            ? { supplier: { disconnect: true } }
            : {}),
        ...(storeId && { store: { connect: { id: storeId } } }),
        ...categoryUpdate,
      },
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
  },

  async delete(id: string) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id },
      include: {
        movements: {
          select: { id: true },
        },
      },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Verificar se existem movimentações associadas
    if (product.movements.length > 0) {
      throw new Error(
        `Cannot delete product. It has ${product.movements.length} associated movements. Please delete the movements first or use force delete.`
      )
    }

    return await db.product.delete({
      where: { id },
    })
  },

  async forceDelete(id: string) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Exclusão em cascata - primeiro excluir movimentações, depois o produto
    await db.movement.deleteMany({
      where: { productId: id },
    })

    return await db.product.delete({
      where: { id },
    })
  },

  async updateStatus(id: string, status: boolean) {
    return await db.product.update({
      where: { id },
      data: { status },
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
  },

  // === FUNÇÕES ADICIONAIS DE PRODUTO ===
  async verifySku(productId: string, sku: string) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Verificar se o SKU já existe em outro produto
    const existingProduct = await db.product.findFirst({
      where: {
        id: { not: productId },
        name: sku, // Assumindo que SKU é o nome do produto
      },
    })

    return {
      available: !existingProduct,
      message: existingProduct ? 'SKU already exists' : 'SKU available',
    }
  },

  async updateStock(
    productId: string,
    quantity: number,
    type: 'INBOUND' | 'OUTBOUND' | 'LOSS',
    note?: string,
    userId?: string
  ) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Calcular novo estoque
    let newStock = 0
    if (type === 'INBOUND') {
      newStock = quantity // Para entrada, adiciona a quantidade
    } else {
      newStock = -quantity // Para saída e perda, subtrai a quantidade
    }

    // Criar movimentação
    const movement = await db.movement.create({
      data: {
        type: type as 'INBOUND' | 'OUTBOUND' | 'LOSS',
        quantity,
        storeId: product.storeId,
        productId,
        note,
        userId,
        balanceAfter: newStock,
      },
      include: {
        supplier: {
          select: {
            id: true,
            corporateName: true,
            cnpj: true,
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

    return {
      product: {
        id: product.id,
        name: product.name,
        currentStock: newStock,
      },
      movement,
    }
  },

  async createMovement(
    productId: string,
    data: {
      type: 'INBOUND' | 'OUTBOUND' | 'LOSS'
      quantity: number
      supplierId?: string
      batch?: string
      expiration?: string
      price?: number
      note?: string
      userId?: string
    }
  ) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Verificar se o fornecedor existe (se fornecido)
    if (data.supplierId) {
      const supplier = await db.supplier.findUnique({
        where: { id: data.supplierId },
      })

      if (!supplier) {
        throw new Error('Supplier not found')
      }
    }

    // Criar movimentação
    const movement = await db.movement.create({
      data: {
        type: data.type as 'INBOUND' | 'OUTBOUND' | 'LOSS',
        quantity: data.quantity,
        storeId: product.storeId,
        productId,
        supplierId: data.supplierId,
        batch: data.batch,
        expiration: data.expiration ? new Date(data.expiration) : null,
        price: data.price,
        note: data.note,
        userId: data.userId,
        balanceAfter: data.quantity, // Assumindo que é o estoque após a movimentação
      },
      include: {
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
            cnpj: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return movement
  },

  async getProductStock(productId: string) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Calcular estoque atual baseado nas movimentações
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

    // Determinar status do estoque
    let status: 'OK' | 'LOW' | 'CRITICAL' | 'OVERSTOCK' = 'OK'

    if (currentStock <= 0) {
      status = 'CRITICAL'
    } else if (currentStock <= product.stockMin) {
      status = 'LOW'
    } else if (currentStock > product.stockMax) {
      status = 'OVERSTOCK'
    }

    return {
      id: product.id,
      name: product.name,
      currentStock,
      stockMin: product.stockMin,
      stockMax: product.stockMax,
      alertPercentage: product.alertPercentage,
      status,
      lastMovement: product.movements[0]
        ? {
            type: product.movements[0].type,
            quantity: product.movements[0].quantity,
            date: product.movements[0].createdAt,
          }
        : null,
    }
  },

  // === MÉTODOS PARA GERENCIAR CATEGORIAS DO PRODUTO ===
  async addCategories(productId: string, categoryIds: string[]) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Verificar se as categorias existem
    const existingCategories = await db.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    })

    if (existingCategories.length !== categoryIds.length) {
      const foundIds = existingCategories.map((c) => c.id)
      const notFoundIds = categoryIds.filter((id) => !foundIds.includes(id))
      throw new Error(`Categories not found: ${notFoundIds.join(', ')}`)
    }

    // Verificar quais categorias já estão associadas
    const existingProductCategories = await db.productCategory.findMany({
      where: {
        productId,
        categoryId: { in: categoryIds },
      },
      select: { categoryId: true },
    })

    const existingCategoryIds = existingProductCategories.map((pc) => pc.categoryId)
    const newCategoryIds = categoryIds.filter((id) => !existingCategoryIds.includes(id))

    if (newCategoryIds.length === 0) {
      throw new Error('All provided categories are already associated with this product')
    }

    // Adicionar novas categorias
    await db.productCategory.createMany({
      data: newCategoryIds.map((categoryId) => ({
        productId,
        categoryId,
      })),
    })

    // Retornar as categorias atualizadas
    const updatedCategories = await db.productCategory.findMany({
      where: { productId },
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
    })

    return {
      message: `${newCategoryIds.length} categories added successfully`,
      addedCount: newCategoryIds.length,
      categories: updatedCategories.map((pc) => pc.category),
    }
  },

  async removeCategories(productId: string, categoryIds: string[]) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Remover as categorias
    const result = await db.productCategory.deleteMany({
      where: {
        productId,
        categoryId: { in: categoryIds },
      },
    })

    return {
      message: `${result.count} categories removed successfully`,
      removedCount: result.count,
    }
  },

  async setCategories(productId: string, categoryIds: string[]) {
    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Verificar se as categorias existem (se fornecidas)
    if (categoryIds.length > 0) {
      const existingCategories = await db.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      })

      if (existingCategories.length !== categoryIds.length) {
        const foundIds = existingCategories.map((c) => c.id)
        const notFoundIds = categoryIds.filter((id) => !foundIds.includes(id))
        throw new Error(`Categories not found: ${notFoundIds.join(', ')}`)
      }
    }

    // Substituir todas as categorias
    await db.productCategory.deleteMany({
      where: { productId },
    })

    if (categoryIds.length > 0) {
      await db.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId,
          categoryId,
        })),
      })
    }

    // Retornar as categorias atualizadas
    const updatedCategories = await db.productCategory.findMany({
      where: { productId },
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
    })

    return {
      message: 'Categories updated successfully',
      categories: updatedCategories.map((pc) => pc.category),
    }
  },

  async bulkDelete(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('No product IDs provided')
    }

    const errors: string[] = []
    let deletedCount = 0

    // Processar cada ID individualmente
    for (const id of ids) {
      try {
        // Verificar se o produto existe e tem movimentações
        const product = await db.product.findUnique({
          where: { id },
          include: {
            movements: {
              select: { id: true },
            },
          },
        })

        if (!product) {
          errors.push(`Product ${id} not found`)
          continue
        }

        // Se tiver movimentações, deletar em cascata
        if (product.movements.length > 0) {
          await db.movement.deleteMany({
            where: { productId: id },
          })
        }

        await db.product.delete({
          where: { id },
        })

        deletedCount++
      } catch (error: any) {
        errors.push(`Failed to delete product ${id}: ${error.message}`)
      }
    }

    return {
      deleted: deletedCount,
      errors,
    }
  },
}
