import type { FastifyRequest } from 'fastify'

// Interfaces para CrmClient
export interface CreateCrmClientRequest extends FastifyRequest {
  body: {
    name: string
    email?: string
    phone?: string
    cpfCnpj?: string
    company?: string
    notes?: string
    stageId?: string
  }
}

export interface UpdateCrmClientRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    email?: string
    phone?: string
    cpfCnpj?: string
    company?: string
    notes?: string
    stageId?: string
  }
}

export interface GetCrmClientRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListCrmClientsRequest extends FastifyRequest {
  querystring: {
    page?: number
    limit?: number
    search?: string
    stageId?: string
  }
}

export interface DeleteCrmClientRequest extends FastifyRequest {
  params: { id: string }
}

export interface SearchCrmClientsRequest extends FastifyRequest {
  querystring: {
    q: string
    limit?: number
  }
}

export interface TransitionStageRequest extends FastifyRequest {
  params: { id: string }
  body: {
    stageId: string | null
  }
}

export interface ListCrmClientsGroupedRequest extends FastifyRequest {
  querystring: {
    grouped?: boolean
  }
}

// Interfaces para CrmStage
export interface CreateCrmStageRequest extends FastifyRequest {
  body: {
    name: string
    color?: string
    order?: number
  }
}

export interface UpdateCrmStageRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    color?: string
    order?: number
  }
}

export interface GetCrmStageRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListCrmStagesRequest extends FastifyRequest {
  querystring: {
    page?: number
    limit?: number
  }
}

export interface DeleteCrmStageRequest extends FastifyRequest {
  params: { id: string }
}

export interface ReorderCrmStageRequest extends FastifyRequest {
  params: { id: string }
  body: {
    order: number
  }
}

// Interfaces de resposta
export interface CrmClientResponse {
  id: string
  storeId: string
  stageId?: string
  name: string
  email?: string
  phone?: string
  cpfCnpj?: string
  company?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  stage?: CrmStageResponse
}

export interface CrmStageResponse {
  id: string
  storeId: string
  name: string
  color?: string
  order: number
  createdAt: Date
  clients?: CrmClientResponse[]
  _count?: {
    clients: number
  }
}

export interface CrmClientsGroupedResponse {
  stages: (CrmStageResponse & { clients: CrmClientResponse[] })[]
  totalClients: number
}

export interface CrmStatsResponse {
  totalClients: number
  clientsByStage: {
    stageId: string
    stageName: string
    clientsCount: number
  }[]
  clientsWithoutStage: number
}
