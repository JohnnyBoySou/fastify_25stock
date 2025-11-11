import type { FastifyRequest } from 'fastify'

// Interfaces para Category
export interface CreateCategoryRequest extends FastifyRequest {
  body: {
    name: string
    description?: string
    code?: string
    status?: boolean
    color?: string
    icon?: string
    parentId?: string
  }
}

export interface UpdateCategoryRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    description?: string
    code?: string
    status?: boolean
    color?: string
    icon?: string
    parentId?: string
  }
}

export interface GetCategoryRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListCategoriesRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
    parentId?: string
  }
}

export interface DeleteCategoryRequest extends FastifyRequest {
  params: { id: string }
}

export interface CategoryResponse {
  id: string
  name: string
  description?: string
  code?: string
  status: boolean
  color?: string
  icon?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  parent?: {
    id: string
    name: string
    description?: string
    code?: string
  }
  children?: Array<{
    id: string
    name: string
    description?: string
    code?: string
    status: boolean
    color?: string
    icon?: string
  }>
  products?: Array<{
    id: string
    name: string
    description?: string
    status: boolean
  }>
  _count?: {
    children: number
    products: number
  }
}

export interface BulkDeleteCategoriesRequest extends FastifyRequest {
  body: {
    ids: string[]
  }
}
