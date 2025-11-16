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
