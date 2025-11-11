import type { FastifySchema } from 'fastify'

export const createSupplierSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['corporateName', 'cnpj'],
    properties: {
      corporateName: { type: 'string', minLength: 1 },
      cnpj: { type: 'string', minLength: 14 },
      tradeName: { type: 'string' },
      cep: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      address: { type: 'string' },
      storeId: { type: 'string' },
      responsibles: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            cpf: { type: 'string' },
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
        corporateName: { type: 'string' },
        cnpj: { type: 'string' },
        tradeName: { type: 'string', nullable: true },
        cep: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        responsibles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              phone: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true },
              cpf: { type: 'string', nullable: true },
              status: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
}

export const updateSupplierSchema: FastifySchema = {
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
      corporateName: { type: 'string', minLength: 1 },
      cnpj: { type: 'string', minLength: 14 },
      tradeName: { type: 'string' },
      status: { type: 'boolean' },
      cep: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
      address: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        corporateName: { type: 'string' },
        cnpj: { type: 'string' },
        tradeName: { type: 'string', nullable: true },
        cep: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const getSupplierSchema: FastifySchema = {
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
        corporateName: { type: 'string' },
        cnpj: { type: 'string' },
        tradeName: { type: 'string', nullable: true },
        cep: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const deleteSupplierSchema: FastifySchema = {
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

export const listSuppliersSchema: FastifySchema = {
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
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              corporateName: { type: 'string' },
              cnpj: { type: 'string' },
              tradeName: { type: 'string', nullable: true },
              cep: { type: 'string', nullable: true },
              city: { type: 'string', nullable: true },
              state: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              responsibles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string', nullable: true },
                    status: { type: 'boolean' },
                  },
                },
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    status: { type: 'boolean' },
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

export const getSupplierByCnpjSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['cnpj'],
    properties: {
      cnpj: { type: 'string', minLength: 14 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        corporateName: { type: 'string' },
        cnpj: { type: 'string' },
        tradeName: { type: 'string', nullable: true },
        cep: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
}

export const getSuppliersByCitySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['city'],
    properties: {
      city: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        suppliers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              corporateName: { type: 'string' },
              cnpj: { type: 'string' },
              tradeName: { type: 'string', nullable: true },
              cep: { type: 'string', nullable: true },
              city: { type: 'string', nullable: true },
              state: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const getSuppliersByStateSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['state'],
    properties: {
      state: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        suppliers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              corporateName: { type: 'string' },
              cnpj: { type: 'string' },
              tradeName: { type: 'string', nullable: true },
              cep: { type: 'string', nullable: true },
              city: { type: 'string', nullable: true },
              state: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const searchSuppliersSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['q'],
    properties: {
      q: { type: 'string', minLength: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        suppliers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              corporateName: { type: 'string' },
              cnpj: { type: 'string' },
              tradeName: { type: 'string', nullable: true },
              cep: { type: 'string', nullable: true },
              city: { type: 'string', nullable: true },
              state: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  },
}

export const SupplierSchemas = {
  create: createSupplierSchema,
  update: updateSupplierSchema,
  get: getSupplierSchema,
  delete: deleteSupplierSchema,
  list: listSuppliersSchema,
  getByCnpj: getSupplierByCnpjSchema,
  getByCity: getSuppliersByCitySchema,
  getByState: getSuppliersByStateSchema,
  search: searchSuppliersSchema,
}
