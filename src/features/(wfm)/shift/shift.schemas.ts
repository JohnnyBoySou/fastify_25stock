import type { FastifySchema } from 'fastify'

export const create: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      occurrenceId: { type: 'string' },
      scheduleId: { type: 'string' },
      participants: {
        type: 'array',
        items: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
            role: { type: 'string' },
            note: { type: 'string' },
          },
        },
      },
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
      occurrenceId: { type: 'string' },
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
      occurrenceId: { type: 'string' },
      scheduleId: { type: 'string' },
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
      occurrenceId: { type: 'string' },
    },
  },
}

export const addParticipant: FastifySchema = {
  params: {
    type: 'object',
    required: ['shiftId'],
    properties: {
      shiftId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: { type: 'string' },
      role: { type: 'string' },
      note: { type: 'string' },
    },
  },
}

export const updateParticipant: FastifySchema = {
  params: {
    type: 'object',
    required: ['shiftId', 'participantId'],
    properties: {
      shiftId: { type: 'string' },
      participantId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      role: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'DECLINED'] },
      note: { type: 'string' },
    },
  },
}

export const removeParticipant: FastifySchema = {
  params: {
    type: 'object',
    required: ['shiftId', 'participantId'],
    properties: {
      shiftId: { type: 'string' },
      participantId: { type: 'string' },
    },
  },
}

export const getParticipants: FastifySchema = {
  params: {
    type: 'object',
    required: ['shiftId'],
    properties: {
      shiftId: { type: 'string' },
    },
  },
}
export const ShiftSchemas = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByQuery,
  addParticipant,
  updateParticipant,
  removeParticipant,
  getParticipants,
}
