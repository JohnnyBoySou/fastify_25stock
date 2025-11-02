import { db } from '@/plugins/prisma'

export const InvoiceQueries = {
  async getById(id: string) {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!invoice) {
      return null
    }

    return invoice
  },

  async list(params: {
    page?: number
    limit?: number
    subscriptionId?: string
    status?: 'PENDING' | 'PAID' | 'FAILED'
    startDate?: string
    endDate?: string
  }) {
    const { page = 1, limit = 10, subscriptionId, status, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (subscriptionId) {
      where.subscriptionId = subscriptionId
    }

    if (status) {
      where.status = status
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

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: {
              user: true,
            },
          },
        },
      }),
      db.invoice.count({ where }),
    ])

    return {
      items: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getByCustomer(
    subscriptionId: string,
    params: {
      page?: number
      limit?: number
      status?: 'PENDING' | 'PAID' | 'FAILED'
    }
  ) {
    const { page = 1, limit = 10, status } = params
    const skip = (page - 1) * limit

    // Verificar se o customer existe
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const where: any = {
      subscriptionId,
    }

    if (status) {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.invoice.count({ where }),
    ])

    return {
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        status: subscription.status,
      },
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getPending() {
    const invoices = await db.invoice.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    return invoices
  },

  async getFailed() {
    const invoices = await db.invoice.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    return invoices
  },

  async getStats() {
    const [total, pending, paid, failed, amountData] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { status: 'PENDING' } }),
      db.invoice.count({ where: { status: 'PAID' } }),
      db.invoice.count({ where: { status: 'FAILED' } }),
      db.invoice.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
      }),
    ])

    // Calcular totais por status
    const [totalPaid, totalPending, totalFailed] = await Promise.all([
      db.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      db.invoice.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      db.invoice.aggregate({
        where: { status: 'FAILED' },
        _sum: { amount: true },
      }),
    ])

    const totalAmount = amountData._sum.amount ? Number(amountData._sum.amount) : 0
    const totalPaidAmount = totalPaid._sum.amount ? Number(totalPaid._sum.amount) : 0
    const totalPendingAmount = totalPending._sum.amount ? Number(totalPending._sum.amount) : 0
    const totalFailedAmount = totalFailed._sum.amount ? Number(totalFailed._sum.amount) : 0
    const averageAmount = amountData._avg.amount ? Number(amountData._avg.amount) : 0

    // Calcular taxa de conversão (pagas / total)
    const conversionRate = total > 0 ? (paid / total) * 100 : 0

    return {
      total,
      pending,
      paid,
      failed,
      totalAmount,
      totalPaid: totalPaidAmount,
      totalPending: totalPendingAmount,
      totalFailed: totalFailedAmount,
      averageAmount,
      conversionRate,
    }
  },

  async generatePdf(invoiceId: string) {
    // Verificar se a fatura existe
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Aqui seria gerado o PDF real
    // Por enquanto, retornamos os dados da fatura formatados para PDF
    const pdfData = {
      invoice: {
        id: invoice.id,
        amount: Number(invoice.amount),
        status: invoice.status,
        createdAt: invoice.createdAt,
        paymentDate: invoice.paymentDate,
      },
      user: {
        name: invoice.subscription.user.name,
        email: invoice.subscription.user.email,
        phone: invoice.subscription.user.phone,
      },
    }

    // Em uma implementação real, aqui seria usado uma biblioteca como PDFKit ou Puppeteer
    // para gerar o PDF propriamente dito
    return {
      success: true,
      pdfData,
      message: 'PDF data prepared for generation',
    }
  },

  async getOverdueInvoices() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    return overdueInvoices
  },

  async getRevenueByPeriod(startDate: Date, endDate: Date) {
    const invoices = await db.invoice.findMany({
      where: {
        status: 'PAID',
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    })

    const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0)

    // Agrupar por plano
    const revenueByPlan = invoices.reduce(
      (acc, invoice) => {
        if (invoice.subscription.polarProductId) {
          const planId = invoice.subscription.polarProductId
          if (!acc[planId]) {
            acc[planId] = {
              plan: invoice.subscription.polarProductId,
              revenue: 0,
              count: 0,
            }
          }
          acc[planId].revenue += Number(invoice.amount)
          acc[planId].count += 1
        }
        return acc
      },
      {} as Record<string, { plan: any; revenue: number; count: number }>
    )

    return {
      totalRevenue,
      invoiceCount: invoices.length,
      revenueByPlan: Object.values(revenueByPlan),
    }
  },
}
