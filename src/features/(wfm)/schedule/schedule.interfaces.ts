import type { FastifyRequest } from 'fastify'

export interface CreateScheduleRequest extends FastifyRequest {
  body: {
    title: string
    description?: string
    date: string // YYYY-MM-DD (obrigatório) - data base do agendamento
    startTime: string // HH:mm (ex: "10:30")
    endTime: string // HH:mm (ex: "11:30")
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
    date?: string // YYYY-MM-DD - data base do agendamento
    startTime?: string // HH:mm (ex: "10:30")
    endTime?: string // HH:mm (ex: "11:30")
    rrule?: string
    timezone?: string
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
    spaceId?: string
  }
}

export interface ApproveScheduleRequest extends FastifyRequest {
  params: { id: string }
}

export interface RejectScheduleRequest extends FastifyRequest {
  params: { id: string }
  body: {
    reason?: string
  }
}
