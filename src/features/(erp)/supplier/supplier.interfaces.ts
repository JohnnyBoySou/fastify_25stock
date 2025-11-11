import type { FastifyRequest } from 'fastify'

export interface CreateSupplierRequest extends FastifyRequest {
  body: {
    corporateName: string
    cnpj: string
    tradeName?: string
    cep?: string
    city?: string
    state?: string
    address?: string
    storeId?: string
    responsibles?: {
      name: string
      phone?: string
      email?: string
      cpf?: string
    }[]
  }
}

export interface UpdateSupplierRequest extends FastifyRequest {
  params: { id: string }
  body: {
    corporateName?: string
    cnpj?: string
    tradeName?: string
    status?: boolean
    cep?: string
    city?: string
    state?: string
    address?: string
  }
}

export interface GetSupplierRequest extends FastifyRequest {
  params: { id: string }
}

export interface DeleteSupplierRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListSuppliersRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
  }
}

export interface GetSupplierByCnpjRequest extends FastifyRequest {
  params: { cnpj: string }
}

export interface GetSuppliersByCityRequest extends FastifyRequest {
  params: { city: string }
}

export interface GetSuppliersByStateRequest extends FastifyRequest {
  params: { state: string }
}

export interface SearchSuppliersRequest extends FastifyRequest {
  query: {
    search: string
    page?: number
    limit?: number
  }
}
