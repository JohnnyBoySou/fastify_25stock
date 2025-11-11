import type { FastifySchema } from 'fastify'

export const createProductSchema: FastifySchema = {
  body: {
    type: 'object',
    required: [
      'name',
      'unitOfMeasure',
      'referencePrice',
      'stockMin',
      'stockMax',
      'alertPercentage',
    ],
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      unitOfMeasure: {
        type: 'string',
        enum: [
          'UNIDADE',
          'KG',
          'L',
          'ML',
          'M',
          'CM',
          'MM',
          'UN',
          'DZ',
          'CX',
          'PCT',
          'KIT',
          'PAR',
          'H',
          'D',
        ],
      },
      referencePrice: { type: 'number', minimum: 0.01 },
      categoryIds: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        minItems: 1,
        uniqueItems: true,
      },
      supplierId: { type: ['string', 'null'], minLength: 1 },
      storeId: { type: 'string', minLength: 1 },
      stockMin: { type: 'number', minimum: 0 },
      stockMax: { type: 'number', minimum: 0 },
      alertPercentage: { type: 'number', minimum: 0, maximum: 100 },
      status: { type: 'boolean', default: true },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        unitOfMeasure: { type: 'string' },
        referencePrice: { type: 'number' },
        supplierId: { type: 'string' },
        storeId: { type: 'string' },
        stockMin: { type: 'number' },
        stockMax: { type: 'number' },
        alertPercentage: { type: 'number' },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
        supplier: { type: 'object' },
        store: { type: 'object' },
      },
    },
  },
}

export const updateProductSchema: FastifySchema = {
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
      unitOfMeasure: {
        type: 'string',
        enum: [
          'UNIDADE',
          'KG',
          'L',
          'ML',
          'M',
          'CM',
          'MM',
          'UN',
          'DZ',
          'CX',
          'PCT',
          'KIT',
          'PAR',
          'H',
          'D',
        ],
      },
      referencePrice: { type: 'number', minimum: 0.01 },
      categoryIds: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        minItems: 1,
        uniqueItems: true,
      },
      supplierId: { type: ['string', 'null'], minLength: 1 },
      storeId: { type: 'string', minLength: 1 },
      stockMin: { type: 'number', minimum: 0 },
      stockMax: { type: 'number', minimum: 0 },
      alertPercentage: { type: 'number', minimum: 0, maximum: 100 },
      status: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        unitOfMeasure: { type: 'string' },
        referencePrice: { type: 'number' },
        supplierId: { type: 'string' },
        storeId: { type: 'string' },
        stockMin: { type: 'number' },
        stockMax: { type: 'number' },
        alertPercentage: { type: 'number' },
        status: { type: 'boolean' },
        updatedAt: { type: 'string', format: 'date-time' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
        supplier: { type: 'object' },
        store: { type: 'object' },
      },
    },
  },
}

export const getProductSchema: FastifySchema = {
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
        unitOfMeasure: { type: 'string' },
        referencePrice: { type: 'number' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
        supplierId: { type: 'string' },
        storeId: { type: 'string' },
        stockMin: { type: 'number' },
        stockMax: { type: 'number' },
        alertPercentage: { type: 'number' },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        category: { type: 'object' },
        supplier: { type: 'object' },
        store: { type: 'object' },
      },
    },
  },
}

export const listProductsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'boolean' },
      categoryIds: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        uniqueItems: true,
      },
      supplierId: { type: 'string' },
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
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              unitOfMeasure: { type: 'string' },
              referencePrice: { type: 'number' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    code: { type: 'string', nullable: true },
                    color: { type: 'string', nullable: true },
                    icon: { type: 'string', nullable: true },
                  },
                },
              },
              supplierId: { type: 'string' },
              storeId: { type: 'string' },
              stockMin: { type: 'number' },
              stockMax: { type: 'number' },
              alertPercentage: { type: 'number' },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              category: { type: 'object' },
              supplier: { type: 'object' },
              store: { type: 'object' },
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

export const deleteProductSchema: FastifySchema = {
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

export const updateStatusSchema: FastifySchema = {
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
      status: { type: 'boolean' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'boolean' },
        category: { type: 'object' },
        supplier: { type: 'object' },
        store: { type: 'object' },
      },
    },
  },
}

// === SCHEMAS PARA FUNÇÕES ADICIONAIS DE PRODUTO ===

export const verifySkuSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['sku'],
    properties: {
      sku: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
}

export const updateStockSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['quantity', 'type'],
    properties: {
      quantity: { type: 'number', minimum: 0.01 },
      type: {
        type: 'string',
        enum: ['ENTRADA', 'SAIDA', 'PERDA'],
      },
      note: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            currentStock: { type: 'number' },
          },
        },
        movement: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            quantity: { type: 'number' },
            note: { type: 'string', nullable: true },
            balanceAfter: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            supplier: { type: 'object', nullable: true },
            user: { type: 'object', nullable: true },
          },
        },
      },
    },
  },
}

export const getProductMovementsSchema: FastifySchema = {
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
      type: {
        type: 'string',
        enum: ['ENTRADA', 'SAIDA', 'PERDA'],
      },
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
              type: { type: 'string' },
              quantity: { type: 'number' },
              batch: { type: 'string', nullable: true },
              expiration: { type: 'string', format: 'date-time', nullable: true },
              price: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              balanceAfter: { type: 'number', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              product: { type: 'object' },
              supplier: { type: 'object', nullable: true },
              user: { type: 'object', nullable: true },
              store: { type: 'object' },
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

export const createProductMovementSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['type', 'quantity'],
    properties: {
      type: {
        type: 'string',
        enum: ['ENTRADA', 'SAIDA', 'PERDA'],
      },
      quantity: { type: 'number', minimum: 0.01 },
      supplierId: { type: 'string' },
      batch: { type: 'string' },
      expiration: { type: 'string', format: 'date' },
      price: { type: 'number', minimum: 0 },
      note: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        quantity: { type: 'number' },
        batch: { type: 'string', nullable: true },
        expiration: { type: 'string', format: 'date-time', nullable: true },
        price: { type: 'number', nullable: true },
        note: { type: 'string', nullable: true },
        balanceAfter: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        product: { type: 'object' },
        supplier: { type: 'object', nullable: true },
        user: { type: 'object', nullable: true },
        store: { type: 'object' },
      },
    },
  },
}

export const getProductStockSchema: FastifySchema = {
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
        currentStock: { type: 'number' },
        stockMin: { type: 'number' },
        stockMax: { type: 'number' },
        alertPercentage: { type: 'number' },
        status: {
          type: 'string',
          enum: ['OK', 'LOW', 'CRITICAL', 'OVERSTOCK'],
        },
        lastMovement: {
          type: 'object',
          nullable: true,
          properties: {
            type: { type: 'string' },
            quantity: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
}

export const getProductStockHistorySchema: FastifySchema = {
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
      limit: { type: 'number', minimum: 1, maximum: 100, default: 30 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            stockMin: { type: 'number' },
            stockMax: { type: 'number' },
            alertPercentage: { type: 'number' },
          },
        },
        currentStock: { type: 'number' },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              quantity: { type: 'number' },
              batch: { type: 'string', nullable: true },
              expiration: { type: 'string', format: 'date-time', nullable: true },
              price: { type: 'number', nullable: true },
              note: { type: 'string', nullable: true },
              balanceAfter: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              supplier: { type: 'object', nullable: true },
              user: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  },
}

export const getLowStockProductsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      storeId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              currentStock: { type: 'number' },
              stockMin: { type: 'number' },
              stockMax: { type: 'number' },
              stockStatus: {
                type: 'string',
                enum: ['LOW', 'CRITICAL'],
              },
              category: { type: 'object', nullable: true },
              supplier: { type: 'object', nullable: true },
              store: { type: 'object' },
            },
          },
        },
      },
    },
  },
}

export const getProductAnalyticsSchema: FastifySchema = {
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
        product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            stockMin: { type: 'number' },
            stockMax: { type: 'number' },
            alertPercentage: { type: 'number' },
          },
        },
        currentStock: { type: 'number' },
        statistics: {
          type: 'object',
          properties: {
            totalMovements: { type: 'number' },
            totalEntrada: { type: 'number' },
            totalSaida: { type: 'number' },
            totalPerda: { type: 'number' },
            monthlyMovements: { type: 'object' },
            supplierStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  supplier: { type: 'object' },
                  totalMovements: { type: 'number' },
                  totalQuantity: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  },
}

// === SCHEMAS PARA GERENCIAR CATEGORIAS DO PRODUTO ===

export const addProductCategoriesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['categoryIds'],
    properties: {
      categoryIds: {
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
        message: { type: 'string' },
        addedCount: { type: 'number' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  },
}

export const removeProductCategoriesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['categoryIds'],
    properties: {
      categoryIds: {
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
        message: { type: 'string' },
        removedCount: { type: 'number' },
      },
    },
  },
}

export const setProductCategoriesSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['categoryIds'],
    properties: {
      categoryIds: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        uniqueItems: true,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  },
}

export const getProductCategoriesSchema: FastifySchema = {
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
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              code: { type: 'string', nullable: true },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  },
}

export const getProductsByCategorySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: { type: 'string' },
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
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              unitOfMeasure: { type: 'string' },
              referencePrice: { type: 'number' },
              stockMin: { type: 'number' },
              stockMax: { type: 'number' },
              alertPercentage: { type: 'number' },
              status: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              supplier: { type: 'object', nullable: true },
              store: { type: 'object' },
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

export const bulkDeleteProductsSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['ids'],
    properties: {
      ids: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
        minItems: 1,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        deleted: { type: 'number' },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
}

export const ProductSchemas = {
  create: createProductSchema,
  update: updateProductSchema,
  get: getProductSchema,
  delete: deleteProductSchema,
  list: listProductsSchema,
  updateStatus: updateStatusSchema,
  bulkDelete: bulkDeleteProductsSchema,
  // Funções adicionais
  verifySku: verifySkuSchema,
  updateStock: updateStockSchema,
  getMovements: getProductMovementsSchema,
  createMovement: createProductMovementSchema,
  getStock: getProductStockSchema,
  getStockHistory: getProductStockHistorySchema,
  getLowStock: getLowStockProductsSchema,
  getAnalytics: getProductAnalyticsSchema,
  // Gerenciar categorias
  addCategories: addProductCategoriesSchema,
  removeCategories: removeProductCategoriesSchema,
  setCategories: setProductCategoriesSchema,
  getCategories: getProductCategoriesSchema,
  getByCategory: getProductsByCategorySchema,
}
