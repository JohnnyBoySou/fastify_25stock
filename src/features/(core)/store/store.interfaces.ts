import type { FastifyRequest } from 'fastify'

export interface CreateStoreRequest extends FastifyRequest {
  body: {
    name: string
    cnpj: string
    email?: string
    phone?: string
    cep?: string
    city?: string
    state?: string
    address?: string
    status?: boolean
  }
}

export interface UpdateStoreRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    cnpj?: string
    email?: string
    phone?: string
    cep?: string
    city?: string
    state?: string
    address?: string
    status?: boolean
  }
}

export interface GetStoreRequest extends FastifyRequest {}

export interface DeleteStoreRequest extends FastifyRequest {}
