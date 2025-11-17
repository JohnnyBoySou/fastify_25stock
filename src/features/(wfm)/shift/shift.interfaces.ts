import type { FastifyRequest } from 'fastify'

export interface CreateShiftRequest extends FastifyRequest {
  body: {
    name: string
    description?: string
    occurrenceId?: string
    scheduleId?: string
  }
}

export interface UpdateShiftRequest extends FastifyRequest {
  body: {
    name?: string
    description?: string
    occurrenceId?: string
    scheduleId?: string
  }
}

export interface AddParticipantRequest extends FastifyRequest {
  params: {
    shiftId: string
  }
  body: {
    userId: string
    role?: string
    note?: string
  }
}

export interface UpdateParticipantRequest extends FastifyRequest {
  params: {
    shiftId: string
    participantId: string
  }
  body: {
    role?: string
    status?: 'PENDING' | 'CONFIRMED' | 'DECLINED'
    note?: string
  }
}
