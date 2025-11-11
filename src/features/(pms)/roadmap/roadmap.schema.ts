import type { FastifySchema } from 'fastify'

export const createRoadmapSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      storeId: { type: 'string' },
      userId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: ['string', 'null'] },
        userId: { type: ['string', 'null'] },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        startDate: { type: ['string', 'null'] },
        endDate: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const updateRoadmapSchema: FastifySchema = {
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
      storeId: { type: 'string' },
      userId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: ['string', 'null'] },
        userId: { type: ['string', 'null'] },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        startDate: { type: ['string', 'null'] },
        endDate: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const getRoadmapSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: ['string', 'null'] },
        userId: { type: ['string', 'null'] },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        startDate: { type: ['string', 'null'] },
        endDate: { type: ['string', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const listRoadmapsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              storeId: { type: ['string', 'null'] },
              userId: { type: ['string', 'null'] },
              title: { type: 'string' },
              description: { type: ['string', 'null'] },
              status: { type: 'string' },
              startDate: { type: ['string', 'null'] },
              endDate: { type: ['string', 'null'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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
  },
}

export const deleteRoadmapSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

export const RoadmapSchemas = {
  create: createRoadmapSchema,
  update: updateRoadmapSchema,
  get: getRoadmapSchema,
  delete: deleteRoadmapSchema,
  list: listRoadmapsSchema,
}
