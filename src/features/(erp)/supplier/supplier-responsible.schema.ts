import type { FastifySchema } from 'fastify'

export const createSupplierResponsibleSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId'],
    properties: {
      supplierId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      cpf: { type: 'string', minLength: 11, maxLength: 14 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        cpf: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        supplierId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const updateSupplierResponsibleSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId', 'responsibleId'],
    properties: {
      supplierId: { type: 'string' },
      responsibleId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      cpf: { type: 'string', minLength: 11, maxLength: 14 },
      status: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        cpf: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        supplierId: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const getSupplierResponsibleSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId', 'responsibleId'],
    properties: {
      supplierId: { type: 'string' },
      responsibleId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        cpf: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        supplierId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const deleteSupplierResponsibleSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId', 'responsibleId'],
    properties: {
      supplierId: { type: 'string' },
      responsibleId: { type: 'string' },
    },
  },
  response: {
    204: { type: 'null' },
  },
}

export const listSupplierResponsiblesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId'],
    properties: {
      supplierId: { type: 'string' },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        responsibles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', nullable: true },
              phone: { type: 'string', nullable: true },
              cpf: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              supplierId: { type: 'string' },
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

export const getSupplierResponsibleByEmailSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId', 'email'],
    properties: {
      supplierId: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        cpf: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        supplierId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const getSupplierResponsibleByCpfSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['supplierId', 'cpf'],
    properties: {
      supplierId: { type: 'string' },
      cpf: { type: 'string', minLength: 11, maxLength: 14 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        cpf: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        supplierId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const SupplierResponsibleSchemas = {
  create: createSupplierResponsibleSchema,
  update: updateSupplierResponsibleSchema,
  get: getSupplierResponsibleSchema,
  delete: deleteSupplierResponsibleSchema,
  list: listSupplierResponsiblesSchema,
  getByEmail: getSupplierResponsibleByEmailSchema,
  getByCpf: getSupplierResponsibleByCpfSchema,
}
