import { db } from '@/plugins/prisma'

export const FolderQueries = {
  async list(params: {
    storeId: string
    page?: number
    limit?: number
    search?: string
    parentId?: string
  }) {
    const { page = 1, limit = 10, storeId, search, parentId } = params
    const skip = (page - 1) * limit

    const where: any = {
      storeId,
      deletedAt: null,
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (parentId) {
      where.parentId = parentId
    } else {
      // Se não especificou parentId, retornar apenas pastas raiz
      where.parentId = null
    }

    const [data, total] = await Promise.all([
      db.folder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: true,
          _count: {
            select: {
              children: {
                where: {
                  deletedAt: null,
                },
              },
              documents: {
                where: {
                  deletedAt: null,
                },
              },
              media: true,
            },
          },
          media: {
            orderBy: { sortOrder: 'asc' },
            include: {
              media: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.folder.count({ where }),
    ])

    return {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getById(id: string, storeId: string) {
    const folder = await db.folder.findFirst({
      where: {
        id,
        storeId,
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: {
            deletedAt: null,
          },
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                children: {
                  where: {
                    deletedAt: null,
                  },
                },
                documents: {
                  where: {
                    deletedAt: null,
                  },
                },
                media: true,
              },
            },
          },
        },
        documents: {
          where: {
            deletedAt: null,
          },
          orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
          include: {
            media: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!folder) {
      throw new Error('Folder not found')
    }

    return folder
  },

  async search(storeId: string, query: string, limit?: number, page?: number) {
    const skip = (page - 1) * limit
    const [folders, total] = await Promise.all([
      db.folder.findMany({
      where: {
        storeId,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take: limit || 10,
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        _count: {
          select: {
            children: {
              where: {
                deletedAt: null,
              },
            },
            documents: {
              where: {
                deletedAt: null,
              },
            },
            media: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    
    db.folder.count({ where: { storeId, deletedAt: null, OR: [ { name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } } ] } })
    ])

    return { items: folders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getTree(storeId: string) {
    const rootFolders = await db.folder.findMany({
      where: {
        storeId,
        parentId: null,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            children: {
              where: {
                deletedAt: null,
              },
            },
            documents: {
              where: {
                deletedAt: null,
              },
            },
            media: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Função recursiva para buscar subpastas
    const buildTree = async (folders: any[]): Promise<any[]> => {
      return Promise.all(
        folders.map(async (folder) => {
          const children = await db.folder.findMany({
            where: {
              parentId: folder.id,
              deletedAt: null,
            },
            orderBy: { name: 'asc' },
            include: {
              _count: {
                select: {
                  children: {
                    where: {
                      deletedAt: null,
                    },
                  },
                  documents: {
                    where: {
                      deletedAt: null,
                    },
                  },
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })

          return {
            ...folder,
            children: children.length > 0 ? await buildTree(children) : [],
          }
        })
      )
    }

    return { tree: await buildTree(rootFolders) }
  },

  async getStats(storeId: string) {
    const total = await db.folder.count({
      where: {
        storeId,
        deletedAt: null,
      },
    })

    const rootFolders = await db.folder.count({
      where: {
        storeId,
        parentId: null,
        deletedAt: null,
      },
    })

    return {
      total,
      rootFolders,
      subFolders: total - rootFolders,
    }
  },
}
