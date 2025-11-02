import type { FastifySchema } from 'fastify'

export const createDocumentSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['title', 'type'],
        properties: {
            folderId: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['TEXT', 'DOCX', 'PDF', 'TEMPLATE', 'OTHER'] },
            format: { type: 'string', enum: ['MARKDOWN', 'HTML', 'JSON', 'DOCX', 'PDF'] },
            content: {},
            path: { type: 'string' },
            size: { type: 'number' },
            mimeType: { type: 'string' },
            visibility: { type: 'string', enum: ['PRIVATE', 'PUBLIC', 'INTERNAL'] },
            status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'DELETED'] },
            pinned: { type: 'boolean' },
        },
    },
}

export const listDocumentsSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            search: { type: 'string' },
            type: { type: 'string', enum: ['TEXT', 'DOCX', 'PDF', 'TEMPLATE', 'OTHER'] },
            format: { type: 'string', enum: ['MARKDOWN', 'HTML', 'JSON', 'DOCX', 'PDF'] },
            folderId: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'DELETED'] },
            visibility: { type: 'string', enum: ['PRIVATE', 'PUBLIC', 'INTERNAL'] },
        },
    },
}

export const getDocumentSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },  
}

export const updateDocumentSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
    body: {
        type: 'object',
        properties: {
            folderId: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['TEXT', 'DOCX', 'PDF', 'TEMPLATE', 'OTHER'] },
            format: { type: 'string', enum: ['MARKDOWN', 'HTML', 'JSON', 'DOCX', 'PDF'] },
            content: {},
            path: { type: 'string' },
            size: { type: 'number' },
            mimeType: { type: 'string' },
            visibility: { type: 'string', enum: ['PRIVATE', 'PUBLIC', 'INTERNAL'] },
            status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'DELETED'] },
            pinned: { type: 'boolean' },
        },
    },
}

export const deleteDocumentSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
}

export const searchDocumentsSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            search: { type: 'string' },
            limit: { type: 'number' },
        },
    },
}

export const DocumentSchemas = {
    create: createDocumentSchema,
    list: listDocumentsSchema,
    get: getDocumentSchema,
    update: updateDocumentSchema,
    delete: deleteDocumentSchema,
    search: searchDocumentsSchema,
}