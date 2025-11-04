import type { FastifySchema } from 'fastify'

export const create: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'spaceId'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      date: {
        type: 'string',
        format: 'date',
        description: 'Data do agendamento (obrigatório quando não há rrule). Formato: YYYY-MM-DD',
      },
      startTime: {
        type: 'string',
        description: 'Horário de início. Se não houver rrule: formato HH:mm (ex: "10:30"). Se houver rrule: formato date-time (ISO 8601)',
      },
      endTime: {
        type: 'string',
        description: 'Horário de término. Se não houver rrule: formato HH:mm (ex: "11:30"). Se houver rrule: formato date-time (ISO 8601)',
      },
      rrule: { type: 'string' },
      timezone: { type: 'string', default: 'America/Sao_Paulo' },
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
      date: {
        type: 'string',
        format: 'date',
        description: 'Data do agendamento (obrigatório quando não há rrule). Formato: YYYY-MM-DD',
      },
      startTime: {
        type: 'string',
        description: 'Horário de início. Se não houver rrule: formato HH:mm (ex: "10:30"). Se houver rrule: formato date-time (ISO 8601)',
      },
      endTime: {
        type: 'string',
        description: 'Horário de término. Se não houver rrule: formato HH:mm (ex: "11:30"). Se houver rrule: formato date-time (ISO 8601)',
      },
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
      page: { type: 'number' },
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
