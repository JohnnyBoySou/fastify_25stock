import type { FastifySchema } from 'fastify'

// Get Flow Execution Schema
export const getFlowExecutionSchema: FastifySchema = {
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
        flowId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['SUCCESS', 'FAILED', 'RUNNING', 'CANCELLED'],
        },
        triggerType: { type: 'string' },
        triggerData: {},
        executionLog: { type: 'array' },
        error: { type: 'string', nullable: true },
        startedAt: { type: 'string' },
        completedAt: { type: 'string', nullable: true },
        duration: { type: 'number', nullable: true },
      },
    },
    404: {
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

// List Flow Executions Schema
export const listFlowExecutionsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      flowId: { type: 'string' },
      status: {
        type: 'string',
        enum: ['SUCCESS', 'FAILED', 'RUNNING', 'CANCELLED'],
      },
      triggerType: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        executions: { type: 'array' },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Get By Flow Schema
export const getByFlowSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['flowId'],
    properties: {
      flowId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      status: {
        type: 'string',
        enum: ['SUCCESS', 'FAILED', 'RUNNING', 'CANCELLED'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        executions: { type: 'array' },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Get Stats Schema
export const getStatsSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['flowId'],
    properties: {
      flowId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            success: { type: 'number' },
            failed: { type: 'number' },
            running: { type: 'number' },
            cancelled: { type: 'number' },
          },
        },
        byTrigger: { type: 'object' },
        averageDuration: { type: 'number' },
        lastExecution: {},
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

// Cancel Execution Schema
export const cancelExecutionSchema: FastifySchema = {
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
        status: {
          type: 'string',
          enum: ['SUCCESS', 'FAILED', 'RUNNING', 'CANCELLED'],
        },
        cancelledAt: { type: 'string' },
      },
    },
    404: {
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

export const FlowExecutionSchemas = {
  get: getFlowExecutionSchema,
  list: listFlowExecutionsSchema,
  getByFlow: getByFlowSchema,
  getStats: getStatsSchema,
  cancel: cancelExecutionSchema,
}
