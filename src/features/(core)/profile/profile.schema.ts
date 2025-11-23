import type { FastifySchema } from 'fastify'

const update: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: ['string', 'null'] },
      birthDate: { type: ['string', 'null'], format: 'date-time' },
      address: { type: ['string', 'null'] },
      number: { type: ['string', 'null'] },
      complement: { type: ['string', 'null'] },
      city: { type: ['string', 'null'] },
      state: { type: ['string', 'null'] },
      country: { type: ['string', 'null'] },
      cep: { type: ['string', 'null'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: ['string', 'null'] },
            birthDate: { type: ['string', 'null'], format: 'date-time' },
            address: { type: ['string', 'null'] },
            number: { type: ['string', 'null'] },
            complement: { type: ['string', 'null'] },
            city: { type: ['string', 'null'] },
            state: { type: ['string', 'null'] },
            country: { type: ['string', 'null'] },
            cep: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
        message: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
}

const single: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: ['string', 'null'] },
            birthDate: { type: ['string', 'null'], format: 'date-time' },
            address: { type: ['string', 'null'] },
            number: { type: ['string', 'null'] },
            complement: { type: ['string', 'null'] },
            city: { type: ['string', 'null'] },
            state: { type: ['string', 'null'] },
            country: { type: ['string', 'null'] },
            cep: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
}

const exclude: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: ['string', 'null'] },
            birthDate: { type: ['string', 'null'], format: 'date-time' },
            address: { type: ['string', 'null'] },
            number: { type: ['string', 'null'] },
            complement: { type: ['string', 'null'] },
            city: { type: ['string', 'null'] },
            state: { type: ['string', 'null'] },
            country: { type: ['string', 'null'] },
            cep: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
        message: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
}

const subscription: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        subscription: {
          type: ['object', 'null'],
          properties: {
            id: { type: 'string' },
            polarProductId: { type: 'string' },
            polarPlanName: { type: 'string' },
            status: { type: 'string' },
            currentPeriodEnd: { type: ['string', 'null'] },
            trialEndsAt: { type: ['string', 'null'] },
            cancelledAt: { type: ['string', 'null'] },
            renewalCount: { type: 'number' },
            priceAmount: { type: 'number' },
            priceInterval: { type: 'string' },
            currency: { type: 'string' },
          },
        },
      },
    },
  },
}

export const ProfileSchemas = {
  update,
  single,
  exclude,
  subscription,
}
