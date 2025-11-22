import { db } from '@/plugins/prisma'
import { InvoiceStatus } from '../invoice.interfaces'

export const InvoiceCommands = {
  async create(data: {
    subscriptionId: string
    amount: number
    status?: InvoiceStatus
    gatewayPaymentId?: string
    paymentDate?: Date
  }) {
    const { subscriptionId, ...createData } = data

    // Verificar se o customer existe
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        store: true,
      },
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    return await db.invoice.create({
      data: {
        ...createData,
        status: data.status || InvoiceStatus.PENDING,
        subscription: { connect: { id: subscriptionId } },
      },
      include: {
        subscription: {
          include: {
            store: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      amount?: number
      status?: InvoiceStatus
      gatewayPaymentId?: string
      paymentDate?: Date
    }
  ) {
    // Verificar se a fatura existe
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    })

    if (!existingInvoice) {
      throw new Error('Invoice not found')
    }

    return await db.invoice.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        subscription: {
          include: {
            store: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    // Verificar se a fatura existe
    const invoice = await db.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return await db.invoice.delete({
      where: { id },
    })
  },

  async updateStatus(
    id: string,
    status: InvoiceStatus,
    paymentDate?: Date,
    gatewayPaymentId?: string
  ) {
    // Verificar se a fatura existe
    const invoice = await db.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    const updateData: any = { status }

    if (status === InvoiceStatus.PAID) {
      updateData.paymentDate = paymentDate || new Date()
      if (gatewayPaymentId) {
        updateData.gatewayPaymentId = gatewayPaymentId
      }
    }

    return await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        subscription: {
          include: {
            store: true,
          },
        },
      },
    })
  },
}
