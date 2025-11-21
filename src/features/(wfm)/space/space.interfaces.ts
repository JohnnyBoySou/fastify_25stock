import type { FastifyRequest } from 'fastify'

export interface CreateSpaceRequest extends FastifyRequest {
  body: {
    name: string
    description?: string
    capacity?: number
    location?: string
    mediaId?: string
    minStartTime?: string
    minEndTime?: string
    minBookingDuration?: number
    gapTime?: number
    requiresApproval?: boolean
    approvalUserId?: string
    allowOverlapping?: boolean
    maxSimultaneousBookings?: number
    resources?: string[]
  }
}

export interface UpdateSpaceRequest extends FastifyRequest {
  body: {
    name?: string
    description?: string
    capacity?: number
    location?: string
    mediaId?: string
    minStartTime?: string
    minEndTime?: string
    minBookingDuration?: number
    gapTime?: number
    requiresApproval?: boolean
    approvalUserId?: string
    allowOverlapping?: boolean
    maxSimultaneousBookings?: number
    resources?: string[]
  }
}
