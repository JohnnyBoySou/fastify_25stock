import type { FastifySchema } from 'fastify'

export const createCategorySchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      code: { type: 'string' },
      status: { type: 'boolean', default: true },
      color: { type: 'string' },
      icon: { type: 'string' },
      parentId: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        code: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        color: { type: 'string', nullable: true },
        icon: { type: 'string', nullable: true },
        parentId: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        parent: { type: 'object', nullable: true },
        children: { type: 'array' },
        products: { type: 'array' },
        _count: {
          type: 'object',
          properties: {
            children: { type: 'number' },
            products: { type: 'number' },
          },
        },
      },
    },
  },
}

export const updateCategorySchema: FastifySchema = {
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
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      code: { type: 'string' },
      status: { type: 'boolean' },
      color: { type: 'string' },
      icon: { type: 'string' },
      parentId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        code: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        color: { type: 'string', nullable: true },
        icon: { type: 'string', nullable: true },
        parentId: { type: 'string', nullable: true },
        updatedAt: { type: 'string', format: 'date-time' },
        parent: { type: 'object', nullable: true },
        children: { type: 'array' },
        products: { type: 'array' },
        _count: {
          type: 'object',
          properties: {
            children: { type: 'number' },
            products: { type: 'number' },
          },
        },
      },
    },
  },
}

export const getCategorySchema: FastifySchema = {
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
        code: { type: 'string', nullable: true },
        status: { type: 'boolean' },
        color: { type: 'string', nullable: true },
        icon: { type: 'string', nullable: true },
        parentId: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        parent: { type: 'object', nullable: true },
        children: { type: 'array' },
        products: { type: 'array' },
        _count: {
          type: 'object',
          properties: {
            children: { type: 'number' },
            products: { type: 'number' },
          },
        },
      },
    },
  },
}

export const listCategoriesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      status: { type: 'boolean' },
      parentId: { type: 'string' },
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
              code: { type: 'string', nullable: true },
              status: { type: 'boolean' },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              parentId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              parent: { type: 'object', nullable: true },
              children: { type: 'array' },
              products: { type: 'array' },
              _count: {
                type: 'object',
                properties: {
                  children: { type: 'number' },
                  products: { type: 'number' },
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

export const deleteCategorySchema: FastifySchema = {
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
        parent: { type: 'object', nullable: true },
        children: { type: 'array' },
        products: { type: 'array' },
        _count: {
          type: 'object',
          properties: {
            children: { type: 'number' },
            products: { type: 'number' },
          },
        },
      },
    },
  },
}

export const getChildrenSchema: FastifySchema = {
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
              status: { type: 'boolean' },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              parentId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              parent: { type: 'object', nullable: true },
              children: { type: 'array' },
              products: { type: 'array' },
              _count: {
                type: 'object',
                properties: {
                  children: { type: 'number' },
                  products: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const getRootCategoriesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'boolean' },
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
              status: { type: 'boolean' },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              parentId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              parent: { type: 'object', nullable: true },
              children: { type: 'array' },
              products: { type: 'array' },
              _count: {
                type: 'object',
                properties: {
                  children: { type: 'number' },
                  products: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const getTopCategoriesByProductsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Número máximo de categorias a retornar (recomendado: 5-10 para gráficos)',
      },
      status: {
        type: 'boolean',
        description: 'Filtrar por status da categoria (true = ativa, false = inativa)',
      },
      includeInactive: {
        type: 'boolean',
        default: false,
        description: 'Incluir categorias inativas no resultado',
      },
      includeProductDetails: {
        type: 'boolean',
        default: false,
        description: 'Incluir detalhes dos produtos em cada categoria',
      },
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
              status: { type: 'boolean' },
              color: { type: 'string', nullable: true },
              icon: { type: 'string', nullable: true },
              parentId: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              parent: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  code: { type: 'string', nullable: true },
                },
              },
              products: {
                type: 'array',
                nullable: true,
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    product: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        status: { type: 'boolean' },
                        sku: { type: 'string', nullable: true },
                        price: { type: 'number', nullable: true },
                        stock: { type: 'number', nullable: true },
                      },
                    },
                  },
                },
              },
              _count: {
                type: 'object',
                properties: {
                  products: { type: 'number' },
                  children: { type: 'number' },
                },
              },
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            limit: { type: 'number' },
            description: { type: 'string' },
            chartType: { type: 'string' },
            recommendedLimit: { type: 'number' },
          },
        },
      },
    },
  },
}

export const getCategoryCreationEvolutionSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['day', 'week', 'month', 'year'],
        default: 'month',
        description: 'Período de agrupamento dos dados',
      },
      startDate: {
        type: 'string',
        format: 'date',
        description: 'Data de início do período (YYYY-MM-DD)',
      },
      endDate: {
        type: 'string',
        format: 'date',
        description: 'Data de fim do período (YYYY-MM-DD)',
      },
      status: {
        type: 'boolean',
        description: 'Filtrar por status da categoria (true = ativa, false = inativa)',
      },
      includeInactive: {
        type: 'boolean',
        default: false,
        description: 'Incluir categorias inativas no resultado',
      },
      includeDetails: {
        type: 'boolean',
        default: false,
        description: 'Incluir detalhes adicionais das categorias',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              count: { type: 'number' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    status: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    parent: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                    _count: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        children: { type: 'number' },
                        products: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        periodStats: {
          type: 'object',
          properties: {
            averagePerPeriod: { type: 'number' },
            maxPerPeriod: { type: 'number' },
            minPerPeriod: { type: 'number' },
            totalPeriods: { type: 'number' },
            periodsWithGrowth: { type: 'number' },
            periodsWithDecline: { type: 'number' },
            periodsStable: { type: 'number' },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            totalCategories: { type: 'number' },
            activeCategories: { type: 'number' },
            inactiveCategories: { type: 'number' },
            period: { type: 'string' },
            startDate: { type: 'string', nullable: true },
            endDate: { type: 'string', nullable: true },
            growthRate: { type: 'number' },
            description: { type: 'string' },
            chartType: { type: 'string' },
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

export const getActiveInactiveRatioSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      includeDetails: {
        type: 'boolean',
        default: false,
        description: 'Incluir detalhes das categorias recentes',
      },
      includeHierarchy: {
        type: 'boolean',
        default: false,
        description: 'Incluir análise hierárquica das categorias',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        active: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            percentage: { type: 'number' },
            recentCategories: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  _count: {
                    type: 'object',
                    properties: {
                      children: { type: 'number' },
                      products: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        inactive: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            percentage: { type: 'number' },
            recentCategories: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  _count: {
                    type: 'object',
                    properties: {
                      children: { type: 'number' },
                      products: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        hygieneScore: { type: 'number' },
        hierarchy: {
          type: 'object',
          nullable: true,
          properties: {
            activeWithChildren: { type: 'number' },
            inactiveWithChildren: { type: 'number' },
            activeWithoutChildren: { type: 'number' },
            inactiveWithoutChildren: { type: 'number' },
            totalWithChildren: { type: 'number' },
            totalWithoutChildren: { type: 'number' },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            chartType: { type: 'string' },
            lastUpdated: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
}

export const getActiveInactiveTrendSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['day', 'week', 'month', 'year'],
        default: 'month',
        description: 'Período de agrupamento dos dados',
      },
      startDate: {
        type: 'string',
        format: 'date',
        description: 'Data de início do período (YYYY-MM-DD)',
      },
      endDate: {
        type: 'string',
        format: 'date',
        description: 'Data de fim do período (YYYY-MM-DD)',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        trendData: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              active: { type: 'number' },
              inactive: { type: 'number' },
              total: { type: 'number' },
            },
          },
        },
        metadata: {
          type: 'object',
          properties: {
            period: { type: 'string' },
            startDate: { type: 'string', nullable: true },
            endDate: { type: 'string', nullable: true },
            description: { type: 'string' },
            chartType: { type: 'string' },
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

export const bulkDeleteCategoriesSchema: FastifySchema = {
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
        message: { type: 'string' },
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

export const CategorySchemas = {
  create: createCategorySchema,
  update: updateCategorySchema,
  get: getCategorySchema,
  delete: deleteCategorySchema,
  list: listCategoriesSchema,
  updateStatus: updateStatusSchema,
  getChildren: getChildrenSchema,
  getRoot: getRootCategoriesSchema,
  getTopCategoriesByProducts: getTopCategoriesByProductsSchema,
  getCategoryCreationEvolution: getCategoryCreationEvolutionSchema,
  getActiveInactiveRatio: getActiveInactiveRatioSchema,
  getActiveInactiveTrend: getActiveInactiveTrendSchema,
  bulkDelete: bulkDeleteCategoriesSchema,
}
