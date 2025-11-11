import type { FastifyRequest } from 'fastify'

// Interfaces para Movement
export interface CreateMovementRequest {
  Body: {
    type: 'ENTRADA' | 'SAIDA' | 'PERDA'
    quantity: number
    storeId: string // Agora obrigatório, vem do middleware
    productId: string
    supplierId?: string
    batch?: string
    expiration?: string
    price?: number
    note?: string
    userId?: string
  }
}

export interface UpdateMovementRequest {
  Params: { id: string }
  Body: {
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    quantity?: number
    supplierId?: string
    batch?: string
    expiration?: string
    price?: number
    note?: string
  }
}

export interface GetMovementRequest {
  Params: { id: string }
}

export interface ListMovementsRequest {
  Querystring: {
    page?: number
    limit?: number
    search?: string
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    storeId?: string
    productId?: string
    supplierId?: string
    startDate?: string
    endDate?: string
  }
}

export interface DeleteMovementRequest {
  Params: { id: string }
}

export interface MovementResponse {
  id: string
  type: 'ENTRADA' | 'SAIDA' | 'PERDA'
  quantity: number
  storeId: string
  productId: string
  supplierId?: string
  batch?: string
  expiration?: Date
  price?: number
  note?: string
  balanceAfter?: number
  createdAt: Date
  updatedAt: Date
  userId?: string
  store?: {
    id: string
    name: string
  }
  product?: {
    id: string
    name: string
    unitOfMeasure: string
  }
  supplier?: {
    id: string
    corporateName: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface MovementStatsResponse {
  total: number
  entrada: number
  saida: number
  perda: number
  totalValue: number
  averageValue: number
  byType: {
    ENTRADA: number
    SAIDA: number
    PERDA: number
  }
  byStore: Array<{
    storeId: string
    storeName: string
    count: number
    totalValue: number
  }>
  byProduct: Array<{
    productId: string
    productName: string
    count: number
    totalQuantity: number
  }>
  bySupplier: Array<{
    supplierId: string
    supplierName: string
    count: number
    totalValue: number
  }>
}

// === INTERFACES PARA FUNÇÕES ADICIONAIS DE MOVIMENTAÇÃO ===

export interface GetMovementReportRequest extends FastifyRequest {
  Querystring: {
    storeId?: string
    productId?: string
    supplierId?: string
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
    format?: 'json' | 'csv' | 'pdf'
  }
}

export interface CreateBulkMovementRequest extends FastifyRequest {
  Body: {
    movements: Array<{
      type: 'ENTRADA' | 'SAIDA' | 'PERDA'
      quantity: number
      storeId: string
      productId: string
      supplierId?: string
      batch?: string
      expiration?: string
      price?: number
      note?: string
    }>
  }
}

export interface VerifyMovementRequest extends FastifyRequest {
  Params: { id: string }
  Body: {
    verified: boolean
    note?: string
  }
}

export interface CancelMovementRequest extends FastifyRequest {
  Params: { id: string }
  Body: {
    reason: string
  }
}

export interface MovementReportResponse {
  summary: {
    totalMovements: number
    totalValue: number
    period: {
      startDate: string
      endDate: string
    }
  }
  data: Array<{
    date: string
    movements: number
    value: number
    entrada: number
    saida: number
    perda: number
  }>
  byType: {
    ENTRADA: {
      count: number
      value: number
      quantity: number
    }
    SAIDA: {
      count: number
      value: number
      quantity: number
    }
    PERDA: {
      count: number
      value: number
      quantity: number
    }
  }
  byStore: Array<{
    storeId: string
    storeName: string
    movements: number
    value: number
  }>
  byProduct: Array<{
    productId: string
    productName: string
    movements: number
    quantity: number
  }>
  bySupplier: Array<{
    supplierId: string
    supplierName: string
    movements: number
    value: number
  }>
}

export interface BulkMovementResponse {
  success: number
  failed: number
  results: Array<{
    index: number
    success: boolean
    movement?: any
    error?: string
  }>
}

export interface MovementVerificationResponse {
  id: string
  verified: boolean
  verifiedAt: Date
  verifiedBy: string
  note?: string
}

export interface MovementCancellationResponse {
  id: string
  cancelled: boolean
  cancelledAt: Date
  cancelledBy: string
  reason: string
}
