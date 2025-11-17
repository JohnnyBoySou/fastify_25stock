import type { FastifySchema } from 'fastify'

export const createFolderSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      color: { type: 'string' },
      icon: { type: 'string' },
      parentId: { type: 'string' },
    },
  },
}

export const listFoldersSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
      search: { type: 'string' },
      parentId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['folder'] },
                  id: { type: 'string' },
                  storeId: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  color: { type: 'string', nullable: true },
                  icon: { type: 'string', nullable: true },
                  parentId: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  deletedAt: { type: 'string', format: 'date-time', nullable: true },
                },
              },
              {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['media'] },
                  id: { type: 'string' },
                  url: { type: 'string' },
                  name: { type: 'string', nullable: true },
                  mimeType: { type: 'string', nullable: true },
                  extension: { type: 'string', nullable: true },
                  size: { type: 'number', nullable: true },
                  folderId: { type: 'string' },
                  folderName: { type: 'string' },
                  sortOrder: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            ],
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getFolderSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
}

export const updateFolderSchema: FastifySchema = {
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
      name: { type: 'string' },
      description: { type: 'string' },
      color: { type: 'string' },
      icon: { type: 'string' },
      parentId: { type: 'string' },
    },
  },
}

export const deleteFolderSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
}

export const searchFoldersSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string' },
      limit: { type: 'number' },
    },
  },
}

export const FolderSchemas = {
  create: createFolderSchema,
  list: listFoldersSchema,
  get: getFolderSchema,
  update: updateFolderSchema,
  delete: deleteFolderSchema,
  search: searchFoldersSchema,
}
