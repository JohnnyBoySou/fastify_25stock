import type { FastifySchema } from 'fastify'

// === SCHEMAS DE VALIDAÇÃO ===

// Schema para criar upload
export const createUploadSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      type: { type: 'string', minLength: 1, maxLength: 100 },
      size: { type: 'number', minimum: 0 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        name: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        size: { type: 'number', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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

// Schema para atualizar upload
export const updateUploadSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      type: { type: 'string', minLength: 1, maxLength: 100 },
      size: { type: 'number', minimum: 0 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        name: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        size: { type: 'number', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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

// Schema para obter upload por ID
export const getUploadSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        name: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        size: { type: 'number', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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

// Schema para listar uploads
export const listUploadsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
      type: { type: 'string' },
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              name: { type: 'string', nullable: true },
              type: { type: 'string', nullable: true },
              size: { type: 'number', nullable: true },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Schema para deletar upload
export const deleteUploadSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
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

// Schema para anexar mídia a uma entidade
export const attachMediaSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['entityType', 'entityId'],
    properties: {
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string', minLength: 1 },
      isPrimary: { type: 'boolean', default: false },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        mediaId: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        isPrimary: { type: 'boolean', nullable: true },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Schema para desanexar mídia de uma entidade
export const detachMediaSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['entityType', 'entityId'],
    properties: {
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
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

// Schema para obter mídias de uma entidade
export const getEntityMediaSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['entityType', 'entityId'],
    properties: {
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        media: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              mediaId: { type: 'string' },
              entityType: { type: 'string' },
              entityId: { type: 'string' },
              isPrimary: { type: 'boolean', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              media: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  url: { type: 'string' },
                  name: { type: 'string', nullable: true },
                  type: { type: 'string', nullable: true },
                  size: { type: 'number', nullable: true },
                },
              },
            },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Schema para definir mídia principal
export const setPrimaryMediaSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  body: {
    type: 'object',
    required: ['entityType', 'entityId'],
    properties: {
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
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

// Schema para buscar por tipo
export const getByTypeSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['type'],
    properties: {
      type: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              name: { type: 'string', nullable: true },
              type: { type: 'string', nullable: true },
              size: { type: 'number', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

// Schema para buscar recentes
export const getRecentSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              name: { type: 'string', nullable: true },
              type: { type: 'string', nullable: true },
              size: { type: 'number', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

// Schema para estatísticas
export const getStatsSchema: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byType: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        totalSize: { type: 'number' },
        recentCount: { type: 'number' },
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

// Schema para busca
export const searchSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['q'],
    properties: {
      q: { type: 'string', minLength: 1 },
      limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              name: { type: 'string', nullable: true },
              type: { type: 'string', nullable: true },
              size: { type: 'number', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

// Schema para uso da mídia
export const getMediaUsageSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        usage: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entityType: { type: 'string' },
              entityId: { type: 'string' },
              isPrimary: { type: 'boolean', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
            },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Schema para mídias não utilizadas
export const getUnusedMediaSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              name: { type: 'string', nullable: true },
              type: { type: 'string', nullable: true },
              size: { type: 'number', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

// Schema para mídia principal
export const getPrimaryMediaSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['entityType', 'entityId'],
    properties: {
      entityType: {
        type: 'string',
        enum: ['product', 'supplier', 'user', 'store'],
      },
      entityId: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        media: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string' },
            name: { type: 'string', nullable: true },
            type: { type: 'string', nullable: true },
            size: { type: 'number', nullable: true },
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
}

// Schema para deletar em lote
export const bulkDeleteSchema: FastifySchema = {
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
        failed: { type: 'number' },
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
