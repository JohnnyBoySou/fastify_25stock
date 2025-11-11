import { db } from '@/plugins/prisma'

export const CategoryCommands = {
  async create(data: {
    name: string
    description?: string
    code?: string
    status?: boolean
    color?: string
    icon?: string
    parentId?: string
    storeId: string
  }) {
    return await db.category.create({
      data: {
        ...data,
        status: data.status ?? true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            children: true,
            products: true,
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
      code?: string
      status?: boolean
      color?: string
      icon?: string
      parentId?: string
    }
  ) {
    return await db.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    return await db.category.delete({
      where: { id },
    })
  },

  async updateStatus(id: string, status: boolean) {
    return await db.category.update({
      where: { id },
      data: { status },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async moveToParent(id: string, parentId: string | null) {
    return await db.category.update({
      where: { id },
      data: { parentId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async bulkDelete(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('No category IDs provided')
    }

    const errors: string[] = []
    let deletedCount = 0

    // Processar cada ID individualmente
    for (const id of ids) {
      try {
        // Verificar se a categoria existe e tem filhos ou produtos
        const category = await db.category.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
        })

        if (!category) {
          errors.push(`Category ${id} not found`)
          continue
        }

        // Se tiver filhos, não pode deletar
        if (category._count.children > 0) {
          errors.push(`Category ${id} has children and cannot be deleted`)
          continue
        }

        // Se tiver produtos, não pode deletar
        if (category._count.products > 0) {
          errors.push(`Category ${id} has products and cannot be deleted`)
          continue
        }

        await db.category.delete({
          where: { id },
        })

        deletedCount++
      } catch (error: any) {
        errors.push(`Failed to delete category ${id}: ${error.message}`)
      }
    }

    return {
      deleted: deletedCount,
      errors,
    }
  },
}
