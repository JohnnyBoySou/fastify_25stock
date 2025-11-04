import type { FastifyRequest } from 'fastify'

export interface CreateScheduleRequest extends FastifyRequest {
  body: {
    title: string
    description?: string
    startTime: string // ISO string
    endTime: string // ISO string
    rrule?: string
    timezone?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    spaceId: string
  }
}

export interface UpdateScheduleRequest extends FastifyRequest {
  body: {
    title?: string
    description?: string
    startTime?: string // ISO string
    endTime?: string // ISO string
    rrule?: string
    timezone?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    spaceId?: string
  }
}
