import type { FastifySchema } from 'fastify'

export const createSubscriptionSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['storeId', 'price', 'interval'],
    properties: {
      storeId: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number', minimum: 0.01 },
      interval: {
        type: 'string',
        enum: ['MONTHLY', 'YEARLY'],
      },
      features: { type: 'object' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        price: { type: 'number' },
        interval: { type: 'string' },
        features: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        customers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const updateSubscriptionSchema: FastifySchema = {
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
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      price: { type: 'number', minimum: 0.01 },
      interval: {
        type: 'string',
        enum: ['MONTHLY', 'YEARLY'],
      },
      features: { type: 'object' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        price: { type: 'number' },
        interval: { type: 'string' },
        features: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        customers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const getSubscriptionSchema: FastifySchema = {
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
        price: { type: 'number' },
        interval: { type: 'string' },
        features: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        customersCount: { type: 'number' },
        customers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const listSubscriptionsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      interval: {
        type: 'string',
        enum: ['MONTHLY', 'YEARLY'],
      },
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
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              price: { type: 'number' },
              interval: { type: 'string' },
              features: { type: 'object', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              customersCount: { type: 'number' },
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

export const deleteSubscriptionSchema: FastifySchema = {
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

export const updateSubscriptionStatusSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['active'],
    properties: {
      active: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        price: { type: 'number' },
        interval: { type: 'string' },
        features: { type: 'object', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const compareSubscriptionsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['subscriptionIds'],
    properties: {
      subscriptionIds: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        minItems: 1,
        uniqueItems: true,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        subscriptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              price: { type: 'number' },
              interval: { type: 'string' },
              features: { type: 'object', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              customersCount: { type: 'number' },
            },
          },
        },
        comparison: {
          type: 'object',
          properties: {
            priceRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
              },
            },
            intervals: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['MONTHLY', 'YEARLY'],
              },
            },
            features: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  },
}

export const getSubscriptionCustomersSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'TRIAL'],
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        subscription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            interval: { type: 'string' },
          },
        },
        customers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              renewalDate: { type: 'string', format: 'date-time', nullable: true },
              trialEndsAt: { type: 'string', format: 'date-time', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                },
              },
              subscription: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  interval: { type: 'string' },
                },
              },
              invoices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    amount: { type: 'number' },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
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

export const getSubscriptionStatsSchema: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        inactive: { type: 'number' },
        monthlySubscriptions: { type: 'number' },
        yearlySubscriptions: { type: 'number' },
        totalCustomers: { type: 'number' },
        totalRevenue: { type: 'number' },
        averagePrice: { type: 'number' },
      },
    },
  },
}

export const SubscriptionSchemas = {
  create: createSubscriptionSchema,
  update: updateSubscriptionSchema,
  get: getSubscriptionSchema,
  delete: deleteSubscriptionSchema,
  list: listSubscriptionsSchema,
  updateStatus: updateSubscriptionStatusSchema,
  compare: compareSubscriptionsSchema,
  getCustomers: getSubscriptionCustomersSchema,
  getStats: getSubscriptionStatsSchema,
}
