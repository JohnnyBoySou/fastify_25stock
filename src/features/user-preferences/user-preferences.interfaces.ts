import type { FastifyRequest } from 'fastify'

// ================================
// USER PREFERENCES INTERFACES
// ================================

export interface UserPreferencesData {
  // Theme & UI Preferences
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  sidebarCollapsed?: boolean
  compactMode?: boolean

  // Language & Localization
  language?: string // pt-BR, en-US, es-ES
  currency?: string // BRL, USD, EUR
  timezone?: string
  dateFormat?: string // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  timeFormat?: '12h' | '24h'
  numberFormat?: string // pt-BR, en-US

  // Notification Preferences
  emailNotifications?: boolean
  pushNotifications?: boolean
  smsNotifications?: boolean
  notificationTypes?: any // JSON com tipos específicos

  // Dashboard & Layout
  dashboardLayout?: any // JSON com layout personalizado
  defaultPage?: string
  itemsPerPage?: number

  // Business Preferences
  autoRefresh?: boolean
  refreshInterval?: number

  // Advanced Settings
  customSettings?: any // JSON com configurações personalizadas
}

export interface CreateUserPreferencesRequest extends FastifyRequest {
  body: UserPreferencesData & {
    userId: string
  }
}

export interface UpdateUserPreferencesRequest extends FastifyRequest {
  params: {
    id: string
  }
  body: Partial<UserPreferencesData>
}

export interface GetUserPreferencesRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface GetUserPreferencesByUserIdRequest extends FastifyRequest {
  params: {
    userId: string
  }
}

export interface DeleteUserPreferencesRequest extends FastifyRequest {
  params: {
    id: string
  }
}

export interface ListUserPreferencesRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    theme?: string
    language?: string
    currency?: string
  }
}

// ================================
// USER PREFERENCES RESPONSE TYPES
// ================================

export interface UserPreferencesResponse {
  id: string
  userId: string
  theme: string
  primaryColor?: string
  sidebarCollapsed: boolean
  compactMode: boolean
  language: string
  currency: string
  timezone: string
  dateFormat: string
  timeFormat: string
  numberFormat: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  notificationTypes?: any
  dashboardLayout?: any
  defaultPage?: string
  itemsPerPage: number
  autoRefresh: boolean
  refreshInterval: number
  customSettings?: any
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferencesListResponse {
  preferences: UserPreferencesResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ================================
// USER PREFERENCES STATS
// ================================

export interface UserPreferencesStats {
  totalPreferences: number
  themeDistribution: {
    light: number
    dark: number
    auto: number
  }
  languageDistribution: {
    [key: string]: number
  }
  currencyDistribution: {
    [key: string]: number
  }
  averageItemsPerPage: number
  notificationsEnabled: number
  notificationsDisabled: number
}

// ================================
// USER PREFERENCES VALIDATION
// ================================

export interface UserPreferencesValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// ================================
// USER PREFERENCES FILTERS
// ================================

export interface UserPreferencesFilters {
  page?: number
  limit?: number
  search?: string
  theme?: string
  language?: string
  currency?: string
  timezone?: string
  hasCustomSettings?: boolean
  notificationsEnabled?: boolean
}
