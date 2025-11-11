import type { FastifyRequest } from 'fastify'

export interface CreateSupplierResponsibleRequest extends FastifyRequest {
  params: { supplierId: string }
  body: {
    name: string
    email?: string
    phone?: string
    cpf?: string
  }
}

export interface UpdateSupplierResponsibleRequest extends FastifyRequest {
  params: { supplierId: string; responsibleId: string }
  body: {
    name?: string
    email?: string
    phone?: string
    cpf?: string
    status?: boolean
  }
}

export interface GetSupplierResponsibleRequest extends FastifyRequest {
  params: { supplierId: string; responsibleId: string }
}

export interface DeleteSupplierResponsibleRequest extends FastifyRequest {
  params: { supplierId: string; responsibleId: string }
}

export interface ListSupplierResponsiblesRequest extends FastifyRequest {
  params: { supplierId: string }
  query: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
  }
}

export interface GetSupplierResponsibleByEmailRequest extends FastifyRequest {
  params: { supplierId: string; email: string }
}

export interface GetSupplierResponsibleByCpfRequest extends FastifyRequest {
  params: { supplierId: string; cpf: string }
}
