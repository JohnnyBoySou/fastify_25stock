import type { FastifyRequest } from 'fastify'

// Tipos de request para Milestone
export type CreateMilestoneRequest = FastifyRequest<{
  Params: { roadmapId: string }
  Body: {
    title: string
    description?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
    progress?: number
    order?: number
    startDate?: string
    endDate?: string
  }
}>

export type GetMilestoneRequest = FastifyRequest<{
  Params: {
    roadmapId: string
    id: string
  }
}>

export type UpdateMilestoneRequest = FastifyRequest<{
  Params: {
    roadmapId: string
    id: string
  }
  Body: {
    title?: string
    description?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
    progress?: number
    order?: number
    startDate?: string
    endDate?: string
  }
}>

export type DeleteMilestoneRequest = FastifyRequest<{
  Params: {
    roadmapId: string
    id: string
  }
}>

export type ListMilestonesRequest = FastifyRequest<{
  Params: { roadmapId: string }
  Querystring: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
    page?: number
    limit?: number
  }
}>

export type UpdateMilestoneProgressRequest = FastifyRequest<{
  Params: {
    roadmapId: string
    id: string
  }
  Body: {
    progress: number
  }
}>

export type UpdateMilestoneStatusRequest = FastifyRequest<{
  Params: {
    roadmapId: string
    id: string
  }
  Body: {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  }
}>
