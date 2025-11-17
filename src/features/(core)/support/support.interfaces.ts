import type { FastifyRequest } from 'fastify'

export interface CreateSupportRequest extends FastifyRequest {
  body: {
    userId: string
    title: string
    description: string
  }
}

export interface FindByIdSupportRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface UpdateSupportRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: {
    title?: string
    description?: string
  }
}

export interface RemoveSupportRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface FindByAllSupportRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
  }
}

export interface FindByQuerySupportRequest extends FastifyRequest {
  query: {
    q?: string
    page?: number
    limit?: number
  }
}

export interface BulkRemoveSupportRequest extends FastifyRequest {
  body: {
    ids: string[]
  }
}

export interface CreateMessageRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: {
    message: string
    attachments?: any
  }
}

export interface FindMessagesByTicketRequest extends FastifyRequest {
  params: {
    id: string
  }
  query: {
    page?: number
    limit?: number
  }
}
