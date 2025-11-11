import type { FastifyRequest } from 'fastify'

// Interfaces para Product
export interface CreateProductRequest extends FastifyRequest {
  body: {
    name: string
    description?: string
    unitOfMeasure:
      | 'UNIDADE'
      | 'KG'
      | 'L'
      | 'ML'
      | 'M'
      | 'CM'
      | 'MM'
      | 'UN'
      | 'DZ'
      | 'CX'
      | 'PCT'
      | 'KIT'
      | 'PAR'
      | 'H'
      | 'D'
    referencePrice: number
    categoryIds?: string[]
    supplierId?: string
    storeId?: string
    stockMin: number
    stockMax: number
    alertPercentage: number
    status?: boolean
  }
}

export interface UpdateProductRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    description?: string
    unitOfMeasure?:
      | 'UNIDADE'
      | 'KG'
      | 'L'
      | 'ML'
      | 'M'
      | 'CM'
      | 'MM'
      | 'UN'
      | 'DZ'
      | 'CX'
      | 'PCT'
      | 'KIT'
      | 'PAR'
      | 'H'
      | 'D'
    referencePrice?: number
    categoryIds?: string[]
    supplierId?: string
    storeId?: string
    stockMin?: number
    stockMax?: number
    alertPercentage?: number
    status?: boolean
  }
}

export interface GetProductRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListProductsRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
    categoryIds?: string[]
    supplierId?: string
    storeId?: string
  }
}

export interface DeleteProductRequest extends FastifyRequest {
  params: { id: string }
}

export interface ProductResponse {
  id: string
  name: string
  description?: string
  unitOfMeasure: string
  referencePrice: number
  supplierId?: string
  storeId: string
  stockMin: number
  stockMax: number
  alertPercentage: number
  status: boolean
  createdAt: Date
  updatedAt: Date
  currentStock: number
  categories?: Array<{
    id: string
    name: string
    description?: string
    code?: string
    color?: string
    icon?: string
  }>
  supplier?: {
    id: string
    corporateName: string
    cnpj: string
    tradeName?: string
  }
  store?: {
    id: string
    name: string
    cnpj: string
  }
}

// === INTERFACES PARA FUNÇÕES ADICIONAIS DE PRODUTO ===

export interface VerifySkuRequest extends FastifyRequest {
  params: { id: string }
  body: {
    sku: string
  }
}

export interface UpdateStockRequest extends FastifyRequest {
  params: { id: string }
  body: {
    quantity: number
    type: 'ENTRADA' | 'SAIDA' | 'PERDA'
    note?: string
  }
}

export interface GetProductMovementsRequest extends FastifyRequest {
  params: { id: string }
  query: {
    page?: number
    limit?: number
    type?: 'ENTRADA' | 'SAIDA' | 'PERDA'
    startDate?: string
    endDate?: string
  }
}

export interface CreateProductMovementRequest extends FastifyRequest {
  params: { id: string }
  body: {
    type: 'ENTRADA' | 'SAIDA' | 'PERDA'
    quantity: number
    supplierId?: string
    batch?: string
    expiration?: string
    price?: number
    note?: string
  }
}

export interface ProductStockResponse {
  id: string
  name: string
  currentStock: number
  stockMin: number
  stockMax: number
  alertPercentage: number
  status: 'OK' | 'LOW' | 'CRITICAL' | 'OVERSTOCK'
  lastMovement?: {
    type: string
    quantity: number
    date: Date
  }
}

export interface ProductMovementResponse {
  id: string
  type: string
  quantity: number
  batch?: string
  expiration?: Date
  price?: number
  note?: string
  balanceAfter?: number
  createdAt: Date
  supplier?: {
    id: string
    corporateName: string
    cnpj: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

// === INTERFACES PARA GERENCIAR CATEGORIAS DO PRODUTO ===

export interface AddProductCategoriesRequest extends FastifyRequest {
  params: { id: string }
  body: {
    categoryIds: string[]
  }
}

export interface RemoveProductCategoriesRequest extends FastifyRequest {
  params: { id: string }
  body: {
    categoryIds: string[]
  }
}

export interface SetProductCategoriesRequest extends FastifyRequest {
  params: { id: string }
  body: {
    categoryIds: string[]
  }
}

export interface GetProductCategoriesRequest extends FastifyRequest {
  params: { id: string }
}

export interface GetProductsByCategoryRequest extends FastifyRequest {
  params: { categoryId: string }
  query: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
  }
}

export enum UnitOfMeasure {
  UNIDADE = 'UNIDADE',
  KG = 'KG',
  L = 'L',
  ML = 'ML',
  M = 'M',
  CM = 'CM',
  MM = 'MM',
  UN = 'UN',
  DZ = 'DZ',
  CX = 'CX',
  PCT = 'PCT',
  KIT = 'KIT',
  PAR = 'PAR',
  H = 'H',
  D = 'D',
}
