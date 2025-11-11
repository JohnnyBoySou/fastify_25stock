import type { FastifySchema } from 'fastify'

export const sendMessageSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        minLength: 1,
        maxLength: 2000,
        description: 'Mensagem do usuário para o chat',
      },
      context: {
        type: 'object',
        properties: {
          storeId: { type: 'string' },
          userId: { type: 'string' },
          sessionId: { type: 'string' },
        },
        additionalProperties: true,
      },
      options: {
        type: 'object',
        properties: {
          temperature: {
            type: 'number',
            minimum: 0,
            maximum: 2,
            default: 0.2,
          },
          numPredict: {
            type: 'number',
            minimum: 1,
            maximum: 4000,
            default: 1000,
          },
          repeatPenalty: {
            type: 'number',
            minimum: 0.1,
            maximum: 2,
            default: 1.1,
          },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        message: { type: 'string' },
        response: { type: 'string' },
        context: {
          type: 'object',
          properties: {
            storeId: { type: 'string', nullable: true },
            userId: { type: 'string', nullable: true },
            sessionId: { type: 'string', nullable: true },
          },
        },
        options: {
          type: 'object',
          properties: {
            temperature: { type: 'number' },
            numPredict: { type: 'number' },
            repeatPenalty: { type: 'number' },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const getChatHistorySchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      sessionId: { type: 'string' },
      userId: { type: 'string' },
      storeId: { type: 'string' },
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
              message: { type: 'string' },
              response: { type: 'string' },
              context: {
                type: 'object',
                properties: {
                  storeId: { type: 'string', nullable: true },
                  userId: { type: 'string', nullable: true },
                  sessionId: { type: 'string', nullable: true },
                },
              },
              options: {
                type: 'object',
                properties: {
                  temperature: { type: 'number' },
                  numPredict: { type: 'number' },
                  repeatPenalty: { type: 'number' },
                },
              },
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

export const getChatSessionSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        storeId: { type: 'string', nullable: true },
        title: { type: 'string', nullable: true },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              message: { type: 'string' },
              response: { type: 'string' },
              context: {
                type: 'object',
                properties: {
                  storeId: { type: 'string', nullable: true },
                  userId: { type: 'string', nullable: true },
                  sessionId: { type: 'string', nullable: true },
                },
              },
              options: {
                type: 'object',
                properties: {
                  temperature: { type: 'number' },
                  numPredict: { type: 'number' },
                  repeatPenalty: { type: 'number' },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const deleteChatSessionSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
}

export const getToolboxSchema: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        availableServices: {
          type: 'object',
          properties: {
            products: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            stores: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            categories: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            suppliers: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            movements: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            reports: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                methods: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const getAnalyticsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      userId: { type: 'string' },
      storeId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        totalMessages: { type: 'number' },
        totalSessions: { type: 'number' },
        averageMessagesPerSession: { type: 'number' },
        mostUsedServices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              usageCount: { type: 'number' },
            },
          },
        },
        messagesByDay: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  },
}

export const ChatSchemas = {
  sendMessage: sendMessageSchema,
  getHistory: getChatHistorySchema,
  getSession: getChatSessionSchema,
  deleteSession: deleteChatSessionSchema,
  getToolbox: getToolboxSchema,
  getAnalytics: getAnalyticsSchema,
}
