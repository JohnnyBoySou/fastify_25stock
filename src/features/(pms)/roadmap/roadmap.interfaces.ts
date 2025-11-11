import type { FastifyRequest } from 'fastify'

// Tipos para RoadmapStatus
export type RoadmapStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

// Interfaces para Roadmap
export interface CreateRoadmapBody {
  storeId?: string
  userId?: string
  title: string
  description?: string
  status?: RoadmapStatus
  startDate?: string
  endDate?: string
}

export interface UpdateRoadmapBody {
  storeId?: string
  userId?: string
  title?: string
  description?: string
  status?: RoadmapStatus
  startDate?: string
  endDate?: string
}

export interface CreateRoadmapRequest extends FastifyRequest {
  body: CreateRoadmapBody
}

export interface UpdateRoadmapRequest extends FastifyRequest {
  params: { id: string }
  body: UpdateRoadmapBody
}

export interface GetRoadmapRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListRoadmapsRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    status?: RoadmapStatus
  }
}

export interface DeleteRoadmapRequest extends FastifyRequest {
  params: { id: string }
}
