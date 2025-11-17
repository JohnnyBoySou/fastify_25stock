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
      where.parentId = null
    }

    const [folders, totalFolders] = await Promise.all([
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
            where: {
              media: {
                deletedAt: null,
                storeId: storeId, // Garantir que a mídia pertence ao mesmo store
              },
            },
            orderBy: { sortOrder: 'asc' },
            include: {
              media: {
                include: {
                  uploadedBy: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
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

    // Se parentId foi passado, também buscar mídias diretamente naquela pasta
    let directMedia: any[] = []
    let parentFolderName: string | undefined
    if (parentId) {
      const [media, parentFolder] = await Promise.all([
        db.folderMedia.findMany({
          where: {
            folderId: parentId,
            media: {
              deletedAt: null,
              storeId: storeId,
            },
          },
          orderBy: { sortOrder: 'asc' },
          include: {
            media: {
              include: {
                uploadedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        db.folder.findFirst({
          where: { id: parentId, storeId, deletedAt: null },
          select: { name: true },
        }),
      ])
      directMedia = media
      parentFolderName = parentFolder?.name
    }

    // Buscar todas as pastas que correspondem ao filtro para contar mídias totais
    const allMatchingFolders = await db.folder.findMany({
      where,
      select: { id: true },
    })
    const allFolderIds = allMatchingFolders.map(f => f.id)

    // Contar total de mídias relacionadas a todas as pastas que correspondem ao filtro
    // Se parentId foi passado, também contar mídias diretamente naquela pasta
    const folderIdsForMediaCount = parentId 
      ? [...allFolderIds, parentId]
      : allFolderIds

    const totalMedia = folderIdsForMediaCount.length > 0 ? await db.folderMedia.count({
      where: {
        folderId: { in: folderIdsForMediaCount },
        media: {
          deletedAt: null,
          storeId: storeId,
        },
      },
    }) : 0

    // Transformar mídias em itens separados
    const items: any[] = []
    
    // Se parentId foi passado, adicionar primeiro as mídias diretamente naquela pasta
    if (parentId && directMedia.length > 0) {
      for (const folderMedia of directMedia) {
        const media = folderMedia.media
        // Extrair o MIME type do campo 'type' da mídia e renomear para 'mimeType'
        const { type: mimeType, ...restMediaData } = media
        
        // Criar item de mídia com todos os dados da mídia + type: 'media' para diferenciar
        items.push({
          ...restMediaData,
          type: 'media', // Tipo do item para diferenciar de pastas
          mimeType: mimeType, // MIME type do arquivo (image/jpeg, etc)
          folderId: parentId,
          folderName: parentFolderName || 'Unknown',
          sortOrder: folderMedia.sortOrder,
        })
      }
    }
    
    // Adicionar pastas e suas mídias
    for (const folder of folders) {
      // Adicionar a pasta como item
      items.push({
        ...folder,
        type: 'folder', // Tipo do item para diferenciar de mídias
      })
      
      // Adicionar cada mídia relacionada como item separado
      if (folder.media && folder.media.length > 0) {
        for (const folderMedia of folder.media) {
          const media = folderMedia.media
          // Extrair o MIME type do campo 'type' da mídia e renomear para 'mimeType'
          const { type: mimeType, ...restMediaData } = media
          
          // Criar item de mídia com todos os dados da mídia + type: 'media' para diferenciar
          items.push({
            ...restMediaData,
            type: 'media', // Tipo do item para diferenciar de pastas
            mimeType: mimeType, // MIME type do arquivo (image/jpeg, etc)
            folderId: folder.id,
            folderName: folder.name,
            sortOrder: folderMedia.sortOrder,
          })
        }
      }
    }

    // Total inclui pastas + mídias relacionadas (incluindo mídias diretas se parentId foi passado)
    const total = totalFolders + totalMedia

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
          where: {
            media: {
              deletedAt: null,
              storeId: storeId, // Garantir que a mídia pertence ao mesmo store
            },
          },
          orderBy: { sortOrder: 'asc' },
          include: {
            media: true, // Não pode usar where aqui, o filtro já está no nível acima
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
