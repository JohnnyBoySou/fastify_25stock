import type { FastifySchema } from 'fastify'

export const create: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      capacity: { type: 'number' },
      location: { type: 'string' },
    },
  },
}

export const getAll: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
      search: { type: 'string' },
    },
  },
}

export const getById: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
}

export const update: FastifySchema = {
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
      capacity: { type: 'number' },
      location: { type: 'string' },
    },
  },
}

export const remove: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
}

export const getByQuery: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string' },
      limit: { type: 'number' },
    },
  },
}

export const SpaceSchemas = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByQuery,
}
