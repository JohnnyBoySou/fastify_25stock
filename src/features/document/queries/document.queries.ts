import { db } from '@/plugins/prisma'

export const DocumentQueries = {
  async list(params: {
    storeId: string
    page?: number
    limit?: number
    search?: string
    type?: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
    format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
    folderId?: string
    status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
    visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
  }) {
    const {
      page = 1,
      limit = 10,
      storeId,
      search,
      type,
      format,
      folderId,
      status,
      visibility,
    } = params
    const skip = (page - 1) * limit

    const where: any = {
      storeId,
      deletedAt: null,
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    if (type) {
      where.type = type
    }

    if (format) {
      where.format = format
    }

    if (folderId) {
      where.folderId = folderId
    }

    if (status) {
      where.status = status
    }

    if (visibility) {
      where.visibility = visibility
    }

    const [data, total] = await Promise.all([
      db.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          folder: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.document.count({ where }),
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
    const document = await db.document.findFirst({
      where: {
        id,
        storeId,
        deletedAt: null,
      },
      include: {
        folder: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 10,
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
      },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    return document
  },

  async search(storeId: string, query: string, limit?: number, page?: number) {
    const skip = (page - 1) * limit
    const documents = await db.document.findMany({
      where: {
        storeId,
        deletedAt: null,
        OR: [{ title: { contains: query, mode: 'insensitive' } }],
      },
      skip,
      take: limit || 10,
      orderBy: { createdAt: 'desc' },
      include: {
        folder: true,
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
      items: documents,
      pagination: {
        page,
        limit,
        total: documents.length,
        totalPages: Math.ceil(documents.length / limit),
      },
    }
  },

  async getByFolder(storeId: string, folderId: string) {
    const documents = await db.document.findMany({
      where: {
        storeId,
        folderId,
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
    })

    return { documents }
  },

  async getPinned(storeId: string) {
    const documents = await db.document.findMany({
      where: {
        storeId,
        pinned: true,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        folder: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return { documents }
  },

  async getStats(storeId: string) {
    const [total, byType, byStatus] = await Promise.all([
      db.document.count({
        where: {
          storeId,
          deletedAt: null,
        },
      }),
      db.document.groupBy({
        by: ['type'],
        where: {
          storeId,
          deletedAt: null,
        },
        _count: true,
      }),
      db.document.groupBy({
        by: ['status'],
        where: {
          storeId,
          deletedAt: null,
        },
        _count: true,
      }),
    ])

    return {
      total,
      byType,
      byStatus,
    }
  },
}
