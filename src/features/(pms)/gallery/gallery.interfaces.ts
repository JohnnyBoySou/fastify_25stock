import type { FastifyRequest } from 'fastify'

// === REQUEST INTERFACES ===
export interface CreateUploadRequest extends FastifyRequest {
  body: {
    name: string
    type: string
    size: number
    folderId?: string
  }
}

export interface GetUploadRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface DeleteUploadRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface ListUploadsRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    type?: string
    entityType?: 'product' | 'supplier' | 'user' | 'store' | 'folder' | 'space'
    entityId?: string
  }
}

export interface AttachMediaRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: {
    entityType: 'product' | 'supplier' | 'user' | 'store' | 'folder' | 'space'
    entityId: string
    isPrimary?: boolean
  }
}

export interface UpdateUploadRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: {
    name?: string
    type?: string
    size?: number
  }
}

export interface DetachMediaRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: {
    entityType: 'product' | 'supplier' | 'user' | 'store' | 'folder' | 'space'
    entityId: string
  }
}

// === RESPONSE INTERFACES ===
export interface UploadResponse {
  id: string
  url: string
  name?: string
  type?: string
  size?: number
  createdAt: Date
  updatedAt: Date
}

export interface UploadListResponse {
  uploads: UploadResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface MediaAttachmentResponse {
  id: string
  mediaId: string
  entityType: string
  entityId: string
  isPrimary?: boolean
  createdAt: Date
}

// === INTERNAL INTERFACES ===
export interface CreateUploadData {
  url: string
  name?: string
  type?: string
  size?: number
  storeId?: string
  uploadedById?: string
  folderId?: string
}

export interface ListUploadsFilters {
  page: number
  limit: number
  search?: string
  type?: string
  entityType?: string
  entityId?: string
  storeId?: string
}

export interface AttachMediaData {
  mediaId: string
  entityType: string
  entityId: string
  isPrimary?: boolean
}
