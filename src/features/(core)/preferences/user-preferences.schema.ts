import type { FastifySchema } from 'fastify'

// ================================
// USER PREFERENCES SCHEMAS
// ================================

export const createUserPreferencesSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        description: 'User ID',
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        default: 'light',
        description: 'Theme preference',
      },
      primaryColor: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: 'Primary color in hex format',
      },
      sidebarCollapsed: {
        type: 'boolean',
        default: false,
        description: 'Whether sidebar is collapsed',
      },
      compactMode: {
        type: 'boolean',
        default: false,
        description: 'Whether to use compact mode',
      },
      language: {
        type: 'string',
        default: 'pt-BR',
        description: 'Language preference',
      },
      currency: {
        type: 'string',
        default: 'BRL',
        description: 'Currency preference',
      },
      timezone: {
        type: 'string',
        default: 'America/Sao_Paulo',
        description: 'Timezone preference',
      },
      dateFormat: {
        type: 'string',
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        default: 'DD/MM/YYYY',
        description: 'Date format preference',
      },
      timeFormat: {
        type: 'string',
        enum: ['12h', '24h'],
        default: '24h',
        description: 'Time format preference',
      },
      numberFormat: {
        type: 'string',
        default: 'pt-BR',
        description: 'Number format preference',
      },
      emailNotifications: {
        type: 'boolean',
        default: true,
        description: 'Email notifications enabled',
      },
      pushNotifications: {
        type: 'boolean',
        default: true,
        description: 'Push notifications enabled',
      },
      smsNotifications: {
        type: 'boolean',
        default: false,
        description: 'SMS notifications enabled',
      },
      notificationTypes: {
        type: 'object',
        description: 'Specific notification types configuration',
      },
      dashboardLayout: {
        type: 'object',
        description: 'Dashboard layout configuration',
      },
      defaultPage: {
        type: 'string',
        description: 'Default page to load',
      },
      itemsPerPage: {
        type: 'integer',
        minimum: 5,
        maximum: 100,
        default: 20,
        description: 'Number of items per page',
      },
      defaultStoreId: {
        type: 'string',
        description: 'Default store ID',
      },
      autoRefresh: {
        type: 'boolean',
        default: true,
        description: 'Auto refresh enabled',
      },
      refreshInterval: {
        type: 'integer',
        minimum: 10,
        maximum: 300,
        default: 30,
        description: 'Refresh interval in seconds',
      },
      customSettings: {
        type: 'object',
        description: 'Custom settings configuration',
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        language: { type: 'string' },
        currency: { type: 'string' },
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
    409: {
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

export const updateUserPreferencesSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'User preferences ID',
      },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        description: 'Theme preference',
      },
      primaryColor: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: 'Primary color in hex format',
      },
      sidebarCollapsed: {
        type: 'boolean',
        description: 'Whether sidebar is collapsed',
      },
      compactMode: {
        type: 'boolean',
        description: 'Whether to use compact mode',
      },
      language: {
        type: 'string',
        description: 'Language preference',
      },
      currency: {
        type: 'string',
        description: 'Currency preference',
      },
      timezone: {
        type: 'string',
        description: 'Timezone preference',
      },
      dateFormat: {
        type: 'string',
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
        description: 'Date format preference',
      },
      timeFormat: {
        type: 'string',
        enum: ['12h', '24h'],
        description: 'Time format preference',
      },
      numberFormat: {
        type: 'string',
        description: 'Number format preference',
      },
      emailNotifications: {
        type: 'boolean',
        description: 'Email notifications enabled',
      },
      pushNotifications: {
        type: 'boolean',
        description: 'Push notifications enabled',
      },
      smsNotifications: {
        type: 'boolean',
        description: 'SMS notifications enabled',
      },
      notificationTypes: {
        type: 'object',
        description: 'Specific notification types configuration',
      },
      dashboardLayout: {
        type: 'object',
        description: 'Dashboard layout configuration',
      },
      defaultPage: {
        type: 'string',
        description: 'Default page to load',
      },
      itemsPerPage: {
        type: 'integer',
        minimum: 5,
        maximum: 100,
        description: 'Number of items per page',
      },
      defaultStoreId: {
        type: 'string',
        description: 'Default store ID',
      },
      autoRefresh: {
        type: 'boolean',
        description: 'Auto refresh enabled',
      },
      refreshInterval: {
        type: 'integer',
        minimum: 10,
        maximum: 300,
        description: 'Refresh interval in seconds',
      },
      customSettings: {
        type: 'object',
        description: 'Custom settings configuration',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        language: { type: 'string' },
        currency: { type: 'string' },
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

export const getUserPreferencesSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'User preferences ID',
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        primaryColor: { type: 'string' },
        sidebarCollapsed: { type: 'boolean' },
        compactMode: { type: 'boolean' },
        language: { type: 'string' },
        currency: { type: 'string' },
        timezone: { type: 'string' },
        dateFormat: { type: 'string' },
        timeFormat: { type: 'string' },
        numberFormat: { type: 'string' },
        emailNotifications: { type: 'boolean' },
        pushNotifications: { type: 'boolean' },
        smsNotifications: { type: 'boolean' },
        notificationTypes: { type: 'object' },
        dashboardLayout: { type: 'object' },
        defaultPage: { type: 'string' },
        itemsPerPage: { type: 'integer' },
        defaultStoreId: { type: 'string' },
        autoRefresh: { type: 'boolean' },
        refreshInterval: { type: 'integer' },
        customSettings: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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

export const getUserPreferencesByUserIdSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'User ID',
      },
    },
    required: ['userId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        primaryColor: { type: 'string' },
        sidebarCollapsed: { type: 'boolean' },
        compactMode: { type: 'boolean' },
        language: { type: 'string' },
        currency: { type: 'string' },
        timezone: { type: 'string' },
        dateFormat: { type: 'string' },
        timeFormat: { type: 'string' },
        numberFormat: { type: 'string' },
        emailNotifications: { type: 'boolean' },
        pushNotifications: { type: 'boolean' },
        smsNotifications: { type: 'boolean' },
        notificationTypes: { type: 'object' },
        dashboardLayout: { type: 'object' },
        defaultPage: { type: 'string' },
        itemsPerPage: { type: 'number' },
        defaultStoreId: { type: 'string' },
        autoRefresh: { type: 'boolean' },
        refreshInterval: { type: 'number' },
        customSettings: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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

// Schema para atualizar preferências do usuário autenticado (rota /me)
export const updateUserPreferencesMeSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        description: 'Theme preference',
      },
      primaryColor: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: 'Primary color in hex format',
      },
      sidebarCollapsed: {
        type: 'boolean',
        description: 'Whether sidebar is collapsed',
      },
      compactMode: {
        type: 'boolean',
        description: 'Whether to use compact mode',
      },
      language: {
        type: 'string',
        description: 'Language preference',
      },
      currency: {
        type: 'string',
        description: 'Currency preference',
      },
      timezone: {
        type: 'string',
        description: 'Timezone preference',
      },
      dateFormat: {
        type: 'string',
        description: 'Date format preference',
      },
      timeFormat: {
        type: 'string',
        enum: ['12h', '24h'],
        description: 'Time format preference',
      },
      numberFormat: {
        type: 'string',
        description: 'Number format preference',
      },
      emailNotifications: {
        type: 'boolean',
        description: 'Email notifications preference',
      },
      pushNotifications: {
        type: 'boolean',
        description: 'Push notifications preference',
      },
      smsNotifications: {
        type: 'boolean',
        description: 'SMS notifications preference',
      },
      notificationTypes: {
        type: 'object',
        description: 'Notification types configuration',
      },
      dashboardLayout: {
        type: 'object',
        description: 'Dashboard layout configuration',
      },
      defaultPage: {
        type: 'string',
        description: 'Default page preference',
      },
      itemsPerPage: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        description: 'Items per page preference',
      },
      defaultStoreId: {
        type: 'string',
        description: 'Default store ID',
      },
      autoRefresh: {
        type: 'boolean',
        description: 'Auto refresh preference',
      },
      refreshInterval: {
        type: 'number',
        minimum: 1000,
        maximum: 300000,
        description: 'Refresh interval in milliseconds',
      },
      customSettings: {
        type: 'object',
        description: 'Custom settings configuration',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        primaryColor: { type: 'string' },
        sidebarCollapsed: { type: 'boolean' },
        compactMode: { type: 'boolean' },
        language: { type: 'string' },
        currency: { type: 'string' },
        timezone: { type: 'string' },
        dateFormat: { type: 'string' },
        timeFormat: { type: 'string' },
        numberFormat: { type: 'string' },
        emailNotifications: { type: 'boolean' },
        pushNotifications: { type: 'boolean' },
        smsNotifications: { type: 'boolean' },
        notificationTypes: { type: 'object' },
        dashboardLayout: { type: 'object' },
        defaultPage: { type: 'string' },
        itemsPerPage: { type: 'number' },
        defaultStoreId: { type: 'string' },
        autoRefresh: { type: 'boolean' },
        refreshInterval: { type: 'number' },
        customSettings: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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
    401: {
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

// Schema para rotas /me (sem parâmetros)
export const getUserPreferencesMeSchema: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        theme: { type: 'string' },
        primaryColor: { type: 'string' },
        sidebarCollapsed: { type: 'boolean' },
        compactMode: { type: 'boolean' },
        language: { type: 'string' },
        currency: { type: 'string' },
        timezone: { type: 'string' },
        dateFormat: { type: 'string' },
        timeFormat: { type: 'string' },
        numberFormat: { type: 'string' },
        emailNotifications: { type: 'boolean' },
        pushNotifications: { type: 'boolean' },
        smsNotifications: { type: 'boolean' },
        notificationTypes: { type: 'object' },
        dashboardLayout: { type: 'object' },
        defaultPage: { type: 'string' },
        itemsPerPage: { type: 'number' },
        defaultStoreId: { type: 'string' },
        autoRefresh: { type: 'boolean' },
        refreshInterval: { type: 'number' },
        customSettings: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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
    401: {
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

export const deleteUserPreferencesSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'User preferences ID',
      },
    },
    required: ['id'],
  },
  response: {
    204: {
      type: 'null',
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

export const listUserPreferencesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Items per page',
      },
      search: {
        type: 'string',
        description: 'Search term',
      },
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        description: 'Filter by theme',
      },
      language: {
        type: 'string',
        description: 'Filter by language',
      },
      currency: {
        type: 'string',
        description: 'Filter by currency',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        preferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              theme: { type: 'string' },
              language: { type: 'string' },
              currency: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
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

export const getUserPreferencesStatsSchema: FastifySchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        totalPreferences: { type: 'integer' },
        themeDistribution: {
          type: 'object',
          properties: {
            light: { type: 'integer' },
            dark: { type: 'integer' },
            auto: { type: 'integer' },
          },
        },
        languageDistribution: {
          type: 'object',
          additionalProperties: { type: 'integer' },
        },
        currencyDistribution: {
          type: 'object',
          additionalProperties: { type: 'integer' },
        },
        averageItemsPerPage: { type: 'integer' },
        notificationsEnabled: { type: 'integer' },
        notificationsDisabled: { type: 'integer' },
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

export const searchUserPreferencesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: 'Search query',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Maximum number of results',
      },
    },
    required: ['q'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        preferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              theme: { type: 'string' },
              language: { type: 'string' },
              currency: { type: 'string' },
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

export const validateUserPreferencesSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
      },
      dateFormat: {
        type: 'string',
        enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      },
      timeFormat: {
        type: 'string',
        enum: ['12h', '24h'],
      },
      itemsPerPage: {
        type: 'integer',
        minimum: 5,
        maximum: 100,
      },
      refreshInterval: {
        type: 'integer',
        minimum: 10,
        maximum: 300,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
        warnings: {
          type: 'array',
          items: { type: 'string' },
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
