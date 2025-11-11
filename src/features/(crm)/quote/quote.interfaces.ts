import type { FastifyRequest } from 'fastify'

export type QuoteStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED'
  | 'CANCELED'
export type PaymentType = 'UNDEFINED' | 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'TRANSFER'

// Interfaces para Quote
export interface CreateQuoteRequest extends FastifyRequest {
  body: {
    title: string
    description?: string
    paymentType: PaymentType
    paymentTerms?: string
    paymentDueDays?: number
    expiresAt?: string
    observations?: string
    discount?: number
    interest?: number
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      discount?: number
      note?: string
    }>
    installments?: Array<{
      number: number
      dueDate: string
      amount: number
      interest?: number
    }>
  }
}

export interface UpdateQuoteRequest extends FastifyRequest {
  params: { id: string }
  body: {
    title?: string
    description?: string
    paymentType?: PaymentType
    paymentTerms?: string
    paymentDueDays?: number
    expiresAt?: string
    observations?: string
    discount?: number
    interest?: number
    items?: Array<{
      id?: string
      productId: string
      quantity: number
      unitPrice: number
      discount?: number
      note?: string
    }>
    installments?: Array<{
      id?: string
      number: number
      dueDate: string
      amount: number
      interest?: number
    }>
  }
}

export interface GetQuoteRequest extends FastifyRequest {
  params: { id: string }
}

export interface GetPublicQuoteRequest extends FastifyRequest {
  params: { publicId: string }
  query: { authCode: string }
}

export interface ListQuotesRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    status?: QuoteStatus
    userId?: string
    startDate?: string
    endDate?: string
  }
}

export interface DeleteQuoteRequest extends FastifyRequest {
  params: { id: string }
}

export interface ApproveQuoteRequest extends FastifyRequest {
  params: { publicId: string }
  body: {
    authCode: string
  }
}

export interface RejectQuoteRequest extends FastifyRequest {
  params: { publicId: string }
  body: {
    authCode: string
    reason?: string
  }
}

export interface UpdateQuoteStatusRequest extends FastifyRequest {
  params: { id: string }
  body: {
    status: QuoteStatus
  }
}

export interface ConvertToMovementRequest extends FastifyRequest {
  params: { id: string }
}

export interface PublishQuoteRequest extends FastifyRequest {
  params: { id: string }
}

export interface SendQuoteRequest extends FastifyRequest {
  params: { id: string }
}

export interface GetQuotesByUserRequest extends FastifyRequest {
  params: { userId: string }
  query: {
    page?: number
    limit?: number
    status?: QuoteStatus
  }
}

// Response interfaces
export interface QuoteResponse {
  id: string
  userId: string
  title: string
  description?: string
  publicId: string
  authCode: string
  status: QuoteStatus
  total: number
  subtotal: number
  discount?: number
  interest?: number
  paymentType: PaymentType
  paymentTerms?: string
  paymentDueDays?: number
  expiresAt?: Date
  observations?: string
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
    discount?: number
    note?: string
    product: {
      id: string
      name: string
      description?: string
      unitOfMeasure: string
      referencePrice: number
    }
  }>
  installments: Array<{
    id: string
    number: number
    dueDate: Date
    amount: number
    interest?: number
  }>
  user: {
    id: string
    name: string
    email: string
  }
}

export interface QuoteStatsResponse {
  total: number
  byStatus: Record<QuoteStatus, number>
  totalValue: number
  averageValue: number
  recentCount: number
}

export interface QuoteMovementResponse {
  quote: QuoteResponse
  movements: Array<{
    id: string
    type: string
    quantity: number
    productId: string
    storeId: string
    note: string
    createdAt: Date
  }>
}

export interface PublicQuoteResponse {
  id: string
  title: string
  description?: string
  status: QuoteStatus
  total: number
  subtotal: number
  discount?: number
  interest?: number
  paymentType: PaymentType
  paymentTerms?: string
  paymentDueDays?: number
  expiresAt?: Date
  observations?: string
  createdAt: Date
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    discount?: number
    note?: string
    product: {
      id: string
      name: string
      description?: string
      unitOfMeasure: string
    }
  }>
  installments: Array<{
    id: string
    number: number
    dueDate: Date
    amount: number
    interest?: number
  }>
  user: {
    name: string
  }
}
