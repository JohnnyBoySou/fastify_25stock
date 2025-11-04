import type { FastifySchema } from 'fastify'

export const create: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'startTime', 'endTime', 'spaceId'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      rrule: { type: 'string' },
      timezone: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
      spaceId: { type: 'string' },
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
      spaceId: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
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
      title: { type: 'string' },
      description: { type: 'string' },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      rrule: { type: 'string' },
      timezone: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
      spaceId: { type: 'string' },  
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
      spaceId: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  },
}

export const ScheduleSchemas = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByQuery,
}
