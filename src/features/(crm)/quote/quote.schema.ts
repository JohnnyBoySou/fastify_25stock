import type { FastifySchema } from 'fastify'

export const createQuoteSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'paymentType', 'items'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      paymentType: {
        type: 'string',
        enum: ['UNDEFINED', 'PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'TRANSFER'],
      },
      paymentTerms: { type: 'string' },
      paymentDueDays: { type: 'number', minimum: 1 },
      expiresAt: { type: 'string', format: 'date-time' },
      observations: { type: 'string' },
      discount: { type: 'number', minimum: 0 },
      interest: { type: 'number', minimum: 0 },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity', 'unitPrice'],
          properties: {
            productId: { type: 'string', minLength: 1 },
            quantity: { type: 'number', minimum: 0.01 },
            unitPrice: { type: 'number', minimum: 0.01 },
            discount: { type: 'number', minimum: 0 },
            note: { type: 'string' },
          },
        },
      },
      installments: {
        type: 'array',
        items: {
          type: 'object',
          required: ['number', 'dueDate', 'amount'],
          properties: {
            number: { type: 'number', minimum: 1 },
            dueDate: { type: 'string', format: 'date-time' },
            amount: { type: 'number', minimum: 0.01 },
            interest: { type: 'number', minimum: 0 },
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        publicId: { type: 'string' },
        authCode: { type: 'string' },
        status: { type: 'string' },
        total: { type: 'number' },
        subtotal: { type: 'number' },
        discount: { type: 'number', nullable: true },
        interest: { type: 'number', nullable: true },
        paymentType: { type: 'string' },
        paymentTerms: { type: 'string', nullable: true },
        paymentDueDays: { type: 'number', nullable: true },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        observations: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              productId: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' },
              discount: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              product: { type: 'object' },
            },
          },
        },
        installments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              dueDate: { type: 'string', format: 'date-time' },
              amount: { type: 'number' },
              interest: { type: 'number', nullable: true },
            },
          },
        },
        user: { type: 'object' },
      },
    },
  },
}

export const updateQuoteSchema: FastifySchema = {
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
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      paymentType: {
        type: 'string',
        enum: ['UNDEFINED', 'PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'TRANSFER'],
      },
      paymentTerms: { type: 'string' },
      paymentDueDays: { type: 'number', minimum: 1 },
      expiresAt: { type: 'string', format: 'date-time' },
      observations: { type: 'string' },
      discount: { type: 'number', minimum: 0 },
      interest: { type: 'number', minimum: 0 },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity', 'unitPrice'],
          properties: {
            id: { type: 'string' },
            productId: { type: 'string', minLength: 1 },
            quantity: { type: 'number', minimum: 0.01 },
            unitPrice: { type: 'number', minimum: 0.01 },
            discount: { type: 'number', minimum: 0 },
            note: { type: 'string' },
          },
        },
      },
      installments: {
        type: 'array',
        items: {
          type: 'object',
          required: ['number', 'dueDate', 'amount'],
          properties: {
            id: { type: 'string' },
            number: { type: 'number', minimum: 1 },
            dueDate: { type: 'string', format: 'date-time' },
            amount: { type: 'number', minimum: 0.01 },
            interest: { type: 'number', minimum: 0 },
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
        userId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        publicId: { type: 'string' },
        authCode: { type: 'string' },
        status: { type: 'string' },
        total: { type: 'number' },
        subtotal: { type: 'number' },
        discount: { type: 'number', nullable: true },
        interest: { type: 'number', nullable: true },
        paymentType: { type: 'string' },
        paymentTerms: { type: 'string', nullable: true },
        paymentDueDays: { type: 'number', nullable: true },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        observations: { type: 'string', nullable: true },
        updatedAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              productId: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' },
              discount: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              product: { type: 'object' },
            },
          },
        },
        installments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              dueDate: { type: 'string', format: 'date-time' },
              amount: { type: 'number' },
              interest: { type: 'number', nullable: true },
            },
          },
        },
        user: { type: 'object' },
      },
    },
  },
}

export const getQuoteSchema: FastifySchema = {
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
        userId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        publicId: { type: 'string' },
        authCode: { type: 'string' },
        status: { type: 'string' },
        total: { type: 'number' },
        subtotal: { type: 'number' },
        discount: { type: 'number', nullable: true },
        interest: { type: 'number', nullable: true },
        paymentType: { type: 'string' },
        paymentTerms: { type: 'string', nullable: true },
        paymentDueDays: { type: 'number', nullable: true },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        observations: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              productId: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' },
              discount: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              product: { type: 'object' },
            },
          },
        },
        installments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              dueDate: { type: 'string', format: 'date-time' },
              amount: { type: 'number' },
              interest: { type: 'number', nullable: true },
            },
          },
        },
        user: { type: 'object' },
      },
    },
  },
}

export const getPublicQuoteSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['publicId'],
    properties: {
      publicId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    required: ['authCode'],
    properties: {
      authCode: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        status: { type: 'string' },
        total: { type: 'number' },
        subtotal: { type: 'number' },
        discount: { type: 'number', nullable: true },
        interest: { type: 'number', nullable: true },
        paymentType: { type: 'string' },
        paymentTerms: { type: 'string', nullable: true },
        paymentDueDays: { type: 'number', nullable: true },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        observations: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              subtotal: { type: 'number' },
              discount: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              product: { type: 'object' },
            },
          },
        },
        installments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              dueDate: { type: 'string', format: 'date-time' },
              amount: { type: 'number' },
              interest: { type: 'number', nullable: true },
            },
          },
        },
        user: { type: 'object' },
      },
    },
  },
}

export const listQuotesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: {
        type: 'string',
        enum: [
          'DRAFT',
          'PUBLISHED',
          'SENT',
          'VIEWED',
          'APPROVED',
          'REJECTED',
          'EXPIRED',
          'CONVERTED',
          'CANCELED',
        ],
      },
      userId: { type: 'string' },
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
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
              userId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string', nullable: true },
              publicId: { type: 'string' },
              authCode: { type: 'string' },
              status: { type: 'string' },
              total: { type: 'number' },
              subtotal: { type: 'number' },
              discount: { type: 'number', nullable: true },
              interest: { type: 'number', nullable: true },
              paymentType: { type: 'string' },
              paymentTerms: { type: 'string', nullable: true },
              paymentDueDays: { type: 'number', nullable: true },
              expiresAt: { type: 'string', format: 'date-time', nullable: true },
              observations: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              items: { type: 'array' },
              installments: { type: 'array' },
              user: { type: 'object' },
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

export const deleteQuoteSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
}

export const updateQuoteStatusSchema: FastifySchema = {
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
        enum: [
          'DRAFT',
          'PUBLISHED',
          'SENT',
          'VIEWED',
          'APPROVED',
          'REJECTED',
          'EXPIRED',
          'CONVERTED',
          'CANCELED',
        ],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const approveQuoteSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['publicId'],
    properties: {
      publicId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['authCode'],
    properties: {
      authCode: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        quote: { type: 'object' },
        movements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              quantity: { type: 'number' },
              productId: { type: 'string' },
              storeId: { type: 'string' },
              note: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const rejectQuoteSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['publicId'],
    properties: {
      publicId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['authCode'],
    properties: {
      authCode: { type: 'string', minLength: 1 },
      reason: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        observations: { type: 'string', nullable: true },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const convertToMovementSchema: FastifySchema = {
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
        quote: { type: 'object' },
        movements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              quantity: { type: 'number' },
              productId: { type: 'string' },
              storeId: { type: 'string' },
              note: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const getQuoteStatsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
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
            DRAFT: { type: 'number' },
            PUBLISHED: { type: 'number' },
            SENT: { type: 'number' },
            VIEWED: { type: 'number' },
            APPROVED: { type: 'number' },
            REJECTED: { type: 'number' },
            EXPIRED: { type: 'number' },
            CONVERTED: { type: 'number' },
            CANCELED: { type: 'number' },
          },
        },
        totalValue: { type: 'number' },
        averageValue: { type: 'number' },
        recentCount: { type: 'number' },
      },
    },
  },
}

export const QuoteSchemas = {
  create: createQuoteSchema,
  update: updateQuoteSchema,
  get: getQuoteSchema,
  getPublic: getPublicQuoteSchema,
  list: listQuotesSchema,
  delete: deleteQuoteSchema,
  updateStatus: updateQuoteStatusSchema,
  approve: approveQuoteSchema,
  reject: rejectQuoteSchema,
  convertToMovement: convertToMovementSchema,
  getStats: getQuoteStatsSchema,
}
