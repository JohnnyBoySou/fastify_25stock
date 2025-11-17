import { db } from '@/plugins/prisma'
import type { ListUploadsFilters } from '../gallery.interfaces'

export const GalleryQueries = {
  async getById(id: string) {
    const upload = await db.media.findUnique({
      where: { id },
    })

    if (!upload) {
      throw new Error('Media not found')
    }

    return upload
  },

  async list(filters: ListUploadsFilters) {
    const { page, limit, search, type, entityType, entityId, storeId } = filters
    const skip = (page - 1) * limit

    // Construir condições de filtro
    const where: any = {}

    // Filtrar por loja (obrigatório para segurança)
    if (storeId) {
      where.storeId = storeId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = { contains: type, mode: 'insensitive' }
    }

    // Se filtrar por entidade, precisamos fazer join
    const include: any = {}
    if (entityType && entityId) {
      switch (entityType) {
        case 'product':
          include.productMedia = {
            where: { productId: entityId },
          }
          break
        case 'supplier':
          include.supplierMedia = {
            where: { supplierId: entityId },
          }
          break
        case 'user':
          include.userMedia = {
            where: { userId: entityId },
          }
          break
        case 'store':
          include.storeMedia = {
            where: { storeId: entityId },
          }
          break
        case 'folder':
          include.folderMedia = {
            where: { folderId: entityId },
          }
          break
        case 'space':
          include.spaceMedia = {
            where: { spaceId: entityId },
          }
          break
      }
    }

    // Buscar uploads
    const [uploads, total] = await Promise.all([
      db.media.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.media.count({ where }),
    ])

    // Filtrar uploads que têm relação com a entidade especificada
    const filteredUploads =
      entityType && entityId
        ? uploads.filter((upload) => {
            switch (entityType) {
              case 'product':
                return upload.productMedia && upload.productMedia.length > 0
              case 'supplier':
                return upload.supplierMedia && upload.supplierMedia.length > 0
              case 'user':
                return upload.userMedia && upload.userMedia.length > 0
              case 'store':
                return upload.storeMedia && upload.storeMedia.length > 0
              case 'folder':
                return upload.folderMedia && upload.folderMedia.length > 0
              case 'space':
                return upload.spaceMedia && upload.spaceMedia.length > 0
              default:
                return true
            }
          })
        : uploads

    return {
      uploads: filteredUploads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByType(type: string, limit = 10, storeId?: string) {
    const where: any = {
      type: { contains: type, mode: 'insensitive' },
    }

    if (storeId) {
      where.storeId = storeId
    }

    const uploads = await db.media.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return uploads
  },

  async getRecent(limit = 20, storeId?: string) {
    const where: any = {}

    if (storeId) {
      where.storeId = storeId
    }

    const uploads = await db.media.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return uploads
  },

  async getEntityMedia(entityType: string, entityId: string) {
    let media: any[] = []

    switch (entityType) {
      case 'product':
        media = await db.productMedia.findMany({
          where: { productId: entityId },
          include: {
            media: true,
          },
          orderBy: [{ isPrimary: 'desc' }],
        })
        break

      case 'supplier':
        media = await db.supplierMedia.findMany({
          where: { supplierId: entityId },
          include: {
            media: true,
          },
          orderBy: { id: 'desc' },
        })
        break

      case 'user':
        media = await db.userMedia.findMany({
          where: { userId: entityId },
          include: {
            media: true,
          },
          orderBy: { id: 'desc' },
        })
        break

      case 'store':
        media = await db.storeMedia.findMany({
          where: { storeId: entityId },
          include: {
            media: true,
          },
          orderBy: { id: 'desc' },
        })
        break

      case 'folder':
        media = await db.folderMedia.findMany({
          where: { folderId: entityId },
          include: {
            media: true,
          },
          orderBy: { sortOrder: 'asc' },
        })
        break

      case 'space':
        media = await db.spaceMedia.findMany({
          where: { spaceId: entityId },
          include: {
            media: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        })
        break

      default:
        throw new Error('Invalid entity type')
    }

    return media.map((item) => ({
      id: item.id,
      mediaId: item.mediaId,
      entityType,
      entityId,
      isPrimary: 'isPrimary' in item ? item.isPrimary : null,
      sortOrder: 'sortOrder' in item ? item.sortOrder : null,
      createdAt: item.createdAt,
      media: item.media,
    }))
  },

  async getPrimaryMedia(entityType: string, entityId: string) {
    let media: any = null

    switch (entityType) {
      case 'product': {
        const productMedia = await db.productMedia.findFirst({
          where: {
            productId: entityId,
            isPrimary: true,
          },
          include: {
            media: true,
          },
        })
        media = productMedia
        break
      }

      case 'space': {
        const spaceMedia = await db.spaceMedia.findFirst({
          where: {
            spaceId: entityId,
            isPrimary: true,
          },
          include: {
            media: true,
          },
        })
        media = spaceMedia || null
        break
      }

      case 'supplier':
      case 'user':
      case 'store':
      case 'folder': {
        // Para essas entidades, pegar a primeira mídia (não têm conceito de principal)
        const firstMedia = await this.getEntityMedia(entityType, entityId)
        media = firstMedia[0] || null
        break
      }

      default:
        throw new Error('Invalid entity type')
    }

    return media
  },

  async search(query: string, limit = 10, storeId?: string) {
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (storeId) {
      where.storeId = storeId
    }

    const uploads = await db.media.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return uploads
  },

  async getStats(storeId?: string) {
    const where: any = {}
    const whereRecent: any = {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
      },
    }

    if (storeId) {
      where.storeId = storeId
      whereRecent.storeId = storeId
    }

    const [total, byType, recentCount] = await Promise.all([
      db.media.count({ where }),
      db.media.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
      }),
      db.media.count({
        where: whereRecent,
      }),
    ])

    return {
      total,
      byType: byType.map((item) => ({
        type: item.type || 'unknown',
        count: item._count.type,
      })),
      recentCount,
    }
  },

  async getUnusedMedia(daysOld = 30, storeId?: string) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

    const where: any = {
      createdAt: { lt: cutoffDate },
      AND: [
        { productMedia: { none: {} } },
        { supplierMedia: { none: {} } },
        { userMedia: { none: {} } },
        { storeMedia: { none: {} } },
        { folderMedia: { none: {} } },
        { spaceMedia: { none: {} } },
      ],
    }

    if (storeId) {
      where.storeId = storeId
    }

    // Buscar mídias antigas que não estão sendo usadas
    const unusedMedia = await db.media.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    return unusedMedia
  },

  async getMediaUsage(mediaId: string) {
    const [productUsage, supplierUsage, userUsage, storeUsage, folderUsage, spaceUsage] = await Promise.all([
      db.productMedia.findMany({
        where: { mediaId },
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      }),
      db.supplierMedia.findMany({
        where: { mediaId },
        include: {
          supplier: {
            select: { id: true, corporateName: true },
          },
        },
      }),
      db.userMedia.findMany({
        where: { mediaId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.storeMedia.findMany({
        where: { mediaId },
        include: {
          store: {
            select: { id: true, name: true },
          },
        },
      }),
      db.folderMedia.findMany({
        where: { mediaId },
        include: {
          folder: {
            select: { id: true, name: true },
          },
        },
      }),
      db.spaceMedia.findMany({
        where: { mediaId },
        include: {
          space: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    return {
      products: productUsage,
      suppliers: supplierUsage,
      users: userUsage,
      stores: storeUsage,
      folders: folderUsage,
      spaces: spaceUsage,
      totalUsage:
        productUsage.length +
        supplierUsage.length +
        userUsage.length +
        storeUsage.length +
        folderUsage.length +
        spaceUsage.length,
    }
  },

  async getAllUsedFilePaths(): Promise<string[]> {
    const media = await db.media.findMany({
      select: { url: true },
    })

    return media.map((m) => m.url)
  },
}
