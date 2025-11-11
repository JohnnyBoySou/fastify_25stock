import type { FastifySchema } from 'fastify'

// Create Flow Schema
export const createFlowSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'nodes', 'edges'],
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      nodes: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'type', 'position', 'data'],
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            position: {
              type: 'object',
              required: ['x', 'y'],
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
              additionalProperties: true,
            },
            data: {
              type: 'object',
              required: ['label'],
              properties: {
                label: { type: 'string' },
                description: { type: 'string' },
                color: { type: 'string' },
                config: {},
              },
              additionalProperties: true,
            },
            width: { type: 'number' },
            height: { type: 'number' },
            selected: { type: 'boolean' },
            positionAbsolute: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
              additionalProperties: true,
            },
            dragging: { type: 'boolean' },
          },
          additionalProperties: true,
        },
      },
      edges: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'source', 'target'],
          properties: {
            id: { type: 'string' },
            source: { type: 'string' },
            target: { type: 'string' },
            type: { type: 'string' },
            animated: { type: 'boolean' },
            style: {
              type: 'object',
              additionalProperties: true,
            },
            markerEnd: {
              oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }],
            },
            label: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
        default: 'DRAFT',
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        nodes: { type: 'array' },
        edges: { type: 'array' },
        status: { type: 'string' },
        storeId: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
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

// Update Flow Schema
export const updateFlowSchema: FastifySchema = {
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
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      nodes: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'type', 'position', 'data'],
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            position: {
              type: 'object',
              required: ['x', 'y'],
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
              additionalProperties: true,
            },
            data: {
              type: 'object',
              required: ['label'],
              properties: {
                label: { type: 'string' },
                description: { type: 'string' },
                color: { type: 'string' },
                config: {},
              },
              additionalProperties: true,
            },
            width: { type: 'number' },
            height: { type: 'number' },
            selected: { type: 'boolean' },
            positionAbsolute: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
              additionalProperties: true,
            },
            dragging: { type: 'boolean' },
          },
          additionalProperties: true,
        },
      },
      edges: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'source', 'target'],
          properties: {
            id: { type: 'string' },
            source: { type: 'string' },
            target: { type: 'string' },
            type: { type: 'string' },
            animated: { type: 'boolean' },
            style: {
              type: 'object',
              additionalProperties: true,
            },
            markerEnd: {
              oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }],
            },
            label: { type: 'string' },
          },
          additionalProperties: true,
        },
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        nodes: { type: 'array' },
        edges: { type: 'array' },
        status: { type: 'string' },
        storeId: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
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

// Get Flow Schema
export const getFlowSchema: FastifySchema = {
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
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        nodes: { type: 'array' },
        edges: { type: 'array' },
        status: { type: 'string' },
        storeId: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
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

// Delete Flow Schema
export const deleteFlowSchema: FastifySchema = {
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// List Flows Schema
export const listFlowsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100 },
      search: { type: 'string' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        items: { type: 'array' },
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

// Update Flow Status Schema
export const updateFlowStatusSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        nodes: { type: 'array' },
        edges: { type: 'array' },
        status: { type: 'string' },
        storeId: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
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

// Duplicate Flow Schema
export const duplicateFlowSchema: FastifySchema = {
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
      name: { type: 'string', minLength: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        nodes: { type: 'array' },
        edges: { type: 'array' },
        status: { type: 'string' },
        storeId: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
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

// Test Flow Schema
export const testFlowSchema: FastifySchema = {
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
      triggerData: {},
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        executionId: { type: 'string' },
        status: { type: 'string' },
        executionLog: { type: 'array' },
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

export const FlowSchemas = {
  create: createFlowSchema,
  update: updateFlowSchema,
  get: getFlowSchema,
  delete: deleteFlowSchema,
  list: listFlowsSchema,
  updateStatus: updateFlowStatusSchema,
  duplicate: duplicateFlowSchema,
  test: testFlowSchema,
}
