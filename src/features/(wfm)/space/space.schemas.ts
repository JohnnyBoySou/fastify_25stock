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
      mediaId: { type: 'string' },
      minStartTime: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }, // Formato HH:mm
      minEndTime: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }, // Formato HH:mm
      minBookingDuration: { type: 'number' }, // Duração mínima em minutos
      gapTime: { type: 'number' }, // Tempo de intervalo em minutos
      requiresApproval: { type: 'boolean' },
      approvalUserId: { type: 'string' }, // ID do usuário que receberá notificações e poderá aprovar
      allowOverlapping: { type: 'boolean' },
      maxSimultaneousBookings: { type: 'number' },
      resources: { type: 'array', items: { type: 'string' } }, // Array de IDs de recursos
    },
  },
}

export const getAll: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
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
      mediaId: { type: 'string' },
      minStartTime: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }, // Formato HH:mm
      minEndTime: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }, // Formato HH:mm
      minBookingDuration: { type: 'number' }, // Duração mínima em minutos
      gapTime: { type: 'number' }, // Tempo de intervalo em minutos
      requiresApproval: { type: 'boolean' },
      approvalUserId: { type: 'string' }, // ID do usuário que receberá notificações e poderá aprovar
      allowOverlapping: { type: 'boolean' },
      maxSimultaneousBookings: { type: 'number' },
      resources: { type: 'array', items: { type: 'string' } }, // Array de IDs de recursos
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
      query: { type: 'string' },
      page: { type: 'number' },
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
