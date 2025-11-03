import type { FastifyRequest } from "fastify"

export interface CreateDocumentRequest extends FastifyRequest {
    body: {
        folderId?: string
        title: string
        type: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
        format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
        content?: any
        path?: string
        size?: number
        mimeType?: string
        visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
        status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
        pinned?: boolean
    }
}

export interface ListDocumentsRequest extends FastifyRequest {
    query: {
        page?: number
        limit?: number
        search?: string
        type?: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
        format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
        folderId?: string
        status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
        visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
    }
}

export interface GetDocumentRequest extends FastifyRequest {
    params: { id: string }  
}

export interface UpdateDocumentRequest extends FastifyRequest {
    params: { id: string }
    body: {
        folderId?: string
        title?: string
        type?: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
        format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
        content?: any
        path?: string
        size?: number
        mimeType?: string
        visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
        status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
        pinned?: boolean
    }
}

export interface DeleteDocumentRequest extends FastifyRequest {
    params: { id: string }
}

export interface DocumentResponse {
    id: string
    storeId: string
    folderId?: string
    title: string
    type: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
    format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
    content?: any
    path?: string
    version: number
    size?: number
    mimeType?: string
    visibility: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
    pinned: boolean
    createdById?: string
    updatedById?: string
    deletedAt?: Date
    createdAt: Date
    updatedAt: Date
    lastAccessedAt?: Date
}

export interface SearchDocumentsRequest extends FastifyRequest {
    query: {
        search: string
        page?: number
        limit?: number
    }
}