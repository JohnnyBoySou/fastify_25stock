import { db } from '@/plugins/prisma'
import type { QuoteStatus } from '../quote.interfaces'

export const QuoteQueries = {
  async getById(id: string) {
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                unitOfMeasure: true,
                referencePrice: true,
              },
            },
          },
        },
        installments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return quote
  },

  async getByPublicId(publicId: string, authCode: string) {
    const quote = await db.quote.findFirst({
      where: {
        publicId,
        authCode,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                unitOfMeasure: true,
              },
            },
          },
        },
        installments: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return quote
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: QuoteStatus
    userId?: string
    startDate?: string
    endDate?: string
  }) {
    const { page = 1, limit = 10, search, status, userId, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  unitOfMeasure: true,
                  referencePrice: true,
                },
              },
            },
          },
          installments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.quote.count({ where }),
    ])

    return {
      items: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByUser(
    userId: string,
    params: {
      page?: number
      limit?: number
      status?: QuoteStatus
    }
  ) {
    const { page = 1, limit = 10, status } = params
    const skip = (page - 1) * limit

    const where: any = { userId }

    if (status) {
      where.status = status
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  unitOfMeasure: true,
                  referencePrice: true,
                },
              },
            },
          },
          installments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.quote.count({ where }),
    ])

    return {
      items: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByStatus(
    status: QuoteStatus,
    params: {
      page?: number
      limit?: number
      userId?: string
    }
  ) {
    const { page = 1, limit = 10, userId } = params
    const skip = (page - 1) * limit

    const where: any = { status }

    if (userId) {
      where.userId = userId
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  unitOfMeasure: true,
                  referencePrice: true,
                },
              },
            },
          },
          installments: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.quote.count({ where }),
    ])

    return {
      items: quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getStats(userId?: string) {
    const where = userId ? { userId } : {}

    const [
      total,
      draft,
      published,
      sent,
      viewed,
      approved,
      rejected,
      expired,
      converted,
      canceled,
      totalValue,
      averageValue,
      recentCount,
    ] = await Promise.all([
      db.quote.count({ where }),
      db.quote.count({ where: { ...where, status: 'DRAFT' } }),
      db.quote.count({ where: { ...where, status: 'PUBLISHED' } }),
      db.quote.count({ where: { ...where, status: 'SENT' } }),
      db.quote.count({ where: { ...where, status: 'VIEWED' } }),
      db.quote.count({ where: { ...where, status: 'APPROVED' } }),
      db.quote.count({ where: { ...where, status: 'REJECTED' } }),
      db.quote.count({ where: { ...where, status: 'EXPIRED' } }),
      db.quote.count({ where: { ...where, status: 'CONVERTED' } }),
      db.quote.count({ where: { ...where, status: 'CANCELED' } }),
      db.quote.aggregate({
        where,
        _sum: { total: true },
      }),
      db.quote.aggregate({
        where,
        _avg: { total: true },
      }),
      db.quote.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
          },
        },
      }),
    ])

    return {
      total,
      byStatus: {
        DRAFT: draft,
        PUBLISHED: published,
        SENT: sent,
        VIEWED: viewed,
        APPROVED: approved,
        REJECTED: rejected,
        EXPIRED: expired,
        CONVERTED: converted,
        CANCELED: canceled,
      },
      totalValue: totalValue._sum.total || 0,
      averageValue: averageValue._avg.total || 0,
      recentCount,
    }
  },

  async search(term: string, limit = 10, userId?: string) {
    const where: any = {
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { observations: { contains: term, mode: 'insensitive' } },
      ],
    }

    if (userId) {
      where.userId = userId
    }

    const quotes = await db.quote.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                unitOfMeasure: true,
                referencePrice: true,
              },
            },
          },
        },
        installments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return quotes
  },

  async getExpiredQuotes() {
    const now = new Date()

    const quotes = await db.quote.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: {
          in: ['PUBLISHED', 'SENT', 'VIEWED'],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return quotes
  },

  async markAsExpired() {
    const now = new Date()

    const result = await db.quote.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: {
          in: ['PUBLISHED', 'SENT', 'VIEWED'],
        },
      },
      data: {
        status: 'EXPIRED',
      },
    })

    return result.count
  },

  async getRecentQuotes(limit = 5, userId?: string) {
    const where = userId ? { userId } : {}

    const quotes = await db.quote.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return quotes
  },

  async getQuoteAnalytics(quoteId: string) {
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitOfMeasure: true,
              },
            },
          },
        },
        installments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!quote) {
      throw new Error('Quote not found')
    }

    // Calcular estatísticas do orçamento
    const totalItems = quote.items.length
    const totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalInstallments = quote.installments.length
    const averageItemValue =
      quote.items.length > 0 ? (quote.total as unknown as number) / quote.items.length : 0

    // Verificar se expirou
    const isExpired = quote.expiresAt ? new Date() > quote.expiresAt : false
    const daysUntilExpiry = quote.expiresAt
      ? Math.ceil((quote.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      quote,
      analytics: {
        totalItems,
        totalQuantity,
        totalInstallments,
        averageItemValue,
        isExpired,
        daysUntilExpiry,
        status: quote.status,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
      },
    }
  },
}
