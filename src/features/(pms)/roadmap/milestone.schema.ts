import type { FastifySchema } from 'fastify'

export const createMilestoneSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId'],
    properties: {
      roadmapId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
        default: 'PENDING',
      },
      progress: { type: 'number', minimum: 0, maximum: 100, default: 0 },
      order: { type: 'number', minimum: 0 },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        roadmapId: { type: 'string' },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        progress: { type: 'number' },
        order: { type: 'number' },
        startDate: { type: ['string', 'null'], format: 'date-time' },
        endDate: { type: ['string', 'null'], format: 'date-time' },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const updateMilestoneSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId', 'id'],
    properties: {
      roadmapId: { type: 'string' },
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
      },
      progress: { type: 'number', minimum: 0, maximum: 100 },
      order: { type: 'number', minimum: 0 },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        roadmapId: { type: 'string' },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        progress: { type: 'number' },
        order: { type: 'number' },
        startDate: { type: ['string', 'null'], format: 'date-time' },
        endDate: { type: ['string', 'null'], format: 'date-time' },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const getMilestoneSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId', 'id'],
    properties: {
      roadmapId: { type: 'string' },
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        roadmapId: { type: 'string' },
        title: { type: 'string' },
        description: { type: ['string', 'null'] },
        status: { type: 'string' },
        progress: { type: 'number' },
        order: { type: 'number' },
        startDate: { type: ['string', 'null'], format: 'date-time' },
        endDate: { type: ['string', 'null'], format: 'date-time' },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const listMilestonesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId'],
    properties: {
      roadmapId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
      },
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
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
              roadmapId: { type: 'string' },
              title: { type: 'string' },
              description: { type: ['string', 'null'] },
              status: { type: 'string' },
              progress: { type: 'number' },
              order: { type: 'number' },
              startDate: { type: ['string', 'null'], format: 'date-time' },
              endDate: { type: ['string', 'null'], format: 'date-time' },
              completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const deleteMilestoneSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId', 'id'],
    properties: {
      roadmapId: { type: 'string' },
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

export const updateMilestoneProgressSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId', 'id'],
    properties: {
      roadmapId: { type: 'string' },
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['progress'],
    properties: {
      progress: { type: 'number', minimum: 0, maximum: 100 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        progress: { type: 'number' },
        status: { type: 'string' },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const updateMilestoneStatusSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId', 'id'],
    properties: {
      roadmapId: { type: 'string' },
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        completedAt: { type: ['string', 'null'], format: 'date-time' },
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

export const reorderMilestonesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['roadmapId'],
    properties: {
      roadmapId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['milestoneIds'],
    properties: {
      milestoneIds: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        milestones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
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

export const MilestoneSchemas = {
  create: createMilestoneSchema,
  update: updateMilestoneSchema,
  get: getMilestoneSchema,
  delete: deleteMilestoneSchema,
  list: listMilestonesSchema,
  updateProgress: updateMilestoneProgressSchema,
  updateStatus: updateMilestoneStatusSchema,
  reorder: reorderMilestonesSchema,
}
