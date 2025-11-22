import type { FastifyRequest } from 'fastify'

export interface CreateFolderRequest extends FastifyRequest {
  body: {
    name: string
    description?: string
    color?: string
    icon?: string
    parentId?: string
  }
}

export interface ListFoldersRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    parentId?: string
  }
}

export interface GetFolderRequest extends FastifyRequest {
  params: { id: string }
}

export interface UpdateFolderRequest extends FastifyRequest {
  params: { id: string }
  body: {
    name?: string
    description?: string
    color?: string
    icon?: string
    parentId?: string
  }
}

export interface DeleteFolderRequest extends FastifyRequest {
  params: { id: string }
}

export interface FolderResponse {
  id: string
  storeId: string
  name: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  createdById?: string
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SearchFoldersRequest extends FastifyRequest {
  query: {
    search: string
    limit?: number
    page?: number
  }
}
