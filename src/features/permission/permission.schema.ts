import type { FastifySchema } from 'fastify'

// ================================
// SCHEMAS PARA LISTAR PERMISSÕES DISPONÍVEIS
// ================================

export const PermissionSchemas = {
  // Listar permissões disponíveis
  listAvailable: {
    querystring: {
      type: 'object',
      properties: {
        resource: { type: 'string' },
        action: { type: 'string' },
        search: { type: 'string', maxLength: 100 },
      },
    },
  } as FastifySchema,

  // Buscar por recurso
  getByResource: {
    params: {
      type: 'object',
      required: ['resource'],
      properties: {
        resource: { type: 'string', minLength: 1 },
      },
    },
  } as FastifySchema,

  // Buscar por ação
  getByAction: {
    params: {
      type: 'object',
      required: ['action'],
      properties: {
        action: { type: 'string', minLength: 1 },
      },
    },
  } as FastifySchema,

  // Listar recursos
  getResources: {
    querystring: {
      type: 'object',
      properties: {
        search: { type: 'string', maxLength: 100 },
      },
    },
  } as FastifySchema,

  // Listar ações
  getActions: {
    querystring: {
      type: 'object',
      properties: {
        search: { type: 'string', maxLength: 100 },
      },
    },
  } as FastifySchema,

  // ================================
  // SCHEMAS PARA ATRIBUIÇÃO DE PERMISSÕES
  // ================================

  // Atribuir permissões a usuário
  assignToUser: {
    body: {
      type: 'object',
      required: ['userId', 'permissions'],
      properties: {
        userId: {
          type: 'string',
          minLength: 1,
        },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['resource', 'action'],
            properties: {
              resource: {
                type: 'string',
                minLength: 1,
              },
              action: {
                type: 'string',
                minLength: 1,
              },
            },
          },
          minItems: 1,
          maxItems: 100,
        },
        scope: {
          type: 'string',
          maxLength: 100,
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
        },
        conditions: {
          type: 'object',
        },
      },
    },
  } as FastifySchema,

  // Remover permissões de usuário
  removeFromUser: {
    body: {
      type: 'object',
      required: ['userId', 'permissions'],
      properties: {
        userId: {
          type: 'string',
          minLength: 1,
        },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['resource', 'action'],
            properties: {
              resource: {
                type: 'string',
                minLength: 1,
              },
              action: {
                type: 'string',
                minLength: 1,
              },
            },
          },
          minItems: 1,
          maxItems: 100,
        },
      },
    },
  } as FastifySchema,

  // Remover todas as permissões de usuário
  removeAllFromUser: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', minLength: 1 },
      },
    },
  } as FastifySchema,

  // Sincronizar permissões de usuário
  syncUserPermissions: {
    body: {
      type: 'object',
      required: ['userId', 'permissions'],
      properties: {
        userId: {
          type: 'string',
          minLength: 1,
        },
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['resource', 'action'],
            properties: {
              resource: {
                type: 'string',
                minLength: 1,
              },
              action: {
                type: 'string',
                minLength: 1,
              },
            },
          },
          maxItems: 100,
        },
        scope: {
          type: 'string',
          maxLength: 100,
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
        },
        conditions: {
          type: 'object',
        },
      },
    },
  } as FastifySchema,

  // Buscar permissões de usuário
  getUserPermissions: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', minLength: 1 },
      },
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
    },
  } as FastifySchema,

  // Verificar permissão de usuário
  checkUserPermission: {
    body: {
      type: 'object',
      required: ['userId', 'resource', 'action'],
      properties: {
        userId: {
          type: 'string',
          minLength: 1,
        },
        resource: {
          type: 'string',
          minLength: 1,
        },
        action: {
          type: 'string',
          minLength: 1,
        },
      },
    },
  } as FastifySchema,
}
