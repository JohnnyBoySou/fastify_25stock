import type { FastifyRequest } from 'fastify'

export interface CreateScheduleRequest extends FastifyRequest {
  body: {
    title: string
    description?: string
    date?: string // YYYY-MM-DD (obrigatório quando não há rrule)
    startTime: string // HH:mm quando não há rrule, ou date-time quando há rrule
    endTime: string // HH:mm quando não há rrule, ou date-time quando há rrule
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
    date?: string // YYYY-MM-DD (obrigatório quando não há rrule)
    startTime?: string // HH:mm quando não há rrule, ou date-time quando há rrule
    endTime?: string // HH:mm quando não há rrule, ou date-time quando há rrule
    rrule?: string
    timezone?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    spaceId?: string
  }
}
