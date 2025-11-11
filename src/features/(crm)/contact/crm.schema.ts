import type { FastifySchema } from 'fastify'

// Schemas para CrmClient
export const createCrmClientSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      cpfCnpj: { type: 'string' },
      company: { type: 'string' },
      notes: { type: 'string' },
      stageId: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        stageId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        cpfCnpj: { type: 'string' },
        company: { type: 'string' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        stage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            color: { type: 'string' },
            order: { type: 'number' },
          },
        },
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

export const updateCrmClientSchema: FastifySchema = {
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
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      cpfCnpj: { type: 'string' },
      company: { type: 'string' },
      notes: { type: 'string' },
      stageId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        stageId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        cpfCnpj: { type: 'string' },
        company: { type: 'string' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        stage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            color: { type: 'string' },
            order: { type: 'number' },
          },
        },
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

export const getCrmClientSchema: FastifySchema = {
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
        storeId: { type: 'string' },
        stageId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        cpfCnpj: { type: 'string' },
        company: { type: 'string' },
        notes: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        stage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            color: { type: 'string' },
            order: { type: 'number' },
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

export const listCrmClientsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      stageId: { type: 'string' },
      grouped: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      oneOf: [
        {
          // Schema para grouped=true
          properties: {
            stages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: ['string', 'null'] },
                  name: { type: 'string' },
                  color: { type: 'string' },
                  order: { type: 'number' },
                  clients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        company: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
            totalClients: { type: 'number' },
          },
        },
        {
          // Schema para grouped=false (padrão)
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  storeId: { type: 'string' },
                  stageId: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  cpfCnpj: { type: 'string' },
                  company: { type: 'string' },
                  notes: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  stage: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      color: { type: 'string' },
                      order: { type: 'number' },
                    },
                  },
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
      ],
    },
  },
}

export const listCrmClientsGroupedSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      grouped: { type: 'boolean', default: true },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: ['string', 'null'] },
              name: { type: 'string' },
              color: { type: 'string' },
              order: { type: 'number' },
              clients: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    company: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
        totalClients: { type: 'number' },
      },
    },
  },
}

export const deleteCrmClientSchema: FastifySchema = {
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

export const transitionStageSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['stageId'],
    properties: {
      stageId: { type: ['string', 'null'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        stageId: { type: 'string' },
        name: { type: 'string' },
        stage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            color: { type: 'string' },
            order: { type: 'number' },
          },
        },
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

// Schemas para CrmStage
export const createCrmStageSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      color: { type: 'string' },
      order: { type: 'number', minimum: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        order: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
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

export const updateCrmStageSchema: FastifySchema = {
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
      color: { type: 'string' },
      order: { type: 'number', minimum: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        order: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
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

export const getCrmStageSchema: FastifySchema = {
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
        storeId: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        order: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        _count: {
          type: 'object',
          properties: {
            clients: { type: 'number' },
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

export const listCrmStagesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
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
              storeId: { type: 'string' },
              name: { type: 'string' },
              color: { type: 'string' },
              order: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              _count: {
                type: 'object',
                properties: {
                  clients: { type: 'number' },
                },
              },
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

export const deleteCrmStageSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
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

export const reorderCrmStageSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['order'],
    properties: {
      order: { type: 'number', minimum: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        storeId: { type: 'string' },
        name: { type: 'string' },
        color: { type: 'string' },
        order: { type: 'number' },
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

export const CrmSchemas = {
  // Client schemas
  createClient: createCrmClientSchema,
  updateClient: updateCrmClientSchema,
  getClient: getCrmClientSchema,
  deleteClient: deleteCrmClientSchema,
  listClients: listCrmClientsSchema,
  listClientsGrouped: listCrmClientsGroupedSchema,
  transitionStage: transitionStageSchema,

  // Stage schemas
  createStage: createCrmStageSchema,
  updateStage: updateCrmStageSchema,
  getStage: getCrmStageSchema,
  deleteStage: deleteCrmStageSchema,
  listStages: listCrmStagesSchema,
  reorderStage: reorderCrmStageSchema,
}
