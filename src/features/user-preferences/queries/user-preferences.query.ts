import { db } from '@/plugins/prisma'
import type { UserPreferencesFilters, UserPreferencesStats } from '../user-preferences.interfaces'
// ================================
// USER PREFERENCES QUERIES
// ================================

export const UserPreferencesQueries = {
  // ================================
  // GET OPERATIONS
  // ================================

  async getById(id: string) {
    try {
      const preferences = await db.userPreferences.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!preferences) {
        throw new Error('User preferences not found')
      }

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences: ${error.message}`)
    }
  },

  async getByUserId(userId: string) {
    try {
      const preferences = await db.userPreferences.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!preferences) {
        throw new Error('User preferences not found')
      }

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences: ${error.message}`)
    }
  },

  async getByUserIdOrCreate(userId: string) {
    try {
      // Primeiro verificar se o usuário existe
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      let preferences = await db.userPreferences.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Se não existir, criar com valores padrão
      if (!preferences) {
        preferences = await db.userPreferences.create({
          data: {
            userId,
            theme: 'light',
            language: 'pt-BR',
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            numberFormat: 'pt-BR',
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            itemsPerPage: 20,
            autoRefresh: true,
            refreshInterval: 30,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      }

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get or create user preferences: ${error.message}`)
    }
  },

  // ================================
  // LIST OPERATIONS
  // ================================

  async list(filters: UserPreferencesFilters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        theme,
        language,
        currency,
        timezone,
        hasCustomSettings,
        notificationsEnabled,
      } = filters

      const skip = (page - 1) * limit

      // Construir filtros
      const where: any = {}

      if (search) {
        where.OR = [
          {
            user: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ]
      }

      if (theme) {
        where.theme = theme
      }

      if (language) {
        where.language = language
      }

      if (currency) {
        where.currency = currency
      }

      if (timezone) {
        where.timezone = timezone
      }

      if (hasCustomSettings !== undefined) {
        if (hasCustomSettings) {
          where.customSettings = {
            not: null,
          }
        } else {
          where.customSettings = null
        }
      }

      if (notificationsEnabled !== undefined) {
        where.emailNotifications = notificationsEnabled
      }

      // Buscar preferências
      const [preferences, total] = await Promise.all([
        db.userPreferences.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        db.userPreferences.count({ where }),
      ])

      return {
        preferences,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      throw new Error(`Failed to list user preferences: ${error.message}`)
    }
  },

  // ================================
  // SEARCH OPERATIONS
  // ================================

  async search(searchTerm: string, limit = 10) {
    try {
      const preferences = await db.userPreferences.findMany({
        where: {
          OR: [
            {
              user: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                email: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              language: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              currency: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to search user preferences: ${error.message}`)
    }
  },

  // ================================
  // STATS OPERATIONS
  // ================================

  async getStats(): Promise<UserPreferencesStats> {
    try {
      const [
        totalPreferences,
        themeStats,
        languageStats,
        currencyStats,
        itemsPerPageStats,
        notificationsStats,
      ] = await Promise.all([
        db.userPreferences.count(),
        db.userPreferences.groupBy({
          by: ['theme'],
          _count: {
            theme: true,
          },
        }),
        db.userPreferences.groupBy({
          by: ['language'],
          _count: {
            language: true,
          },
        }),
        db.userPreferences.groupBy({
          by: ['currency'],
          _count: {
            currency: true,
          },
        }),
        db.userPreferences.aggregate({
          _avg: {
            itemsPerPage: true,
          },
        }),
        db.userPreferences.groupBy({
          by: ['emailNotifications'],
          _count: {
            emailNotifications: true,
          },
        }),
      ])

      // Processar estatísticas de tema
      const themeDistribution = {
        light: 0,
        dark: 0,
        auto: 0,
      }

      for (const stat of themeStats) {
        if (stat.theme === 'light') themeDistribution.light = stat._count.theme
        if (stat.theme === 'dark') themeDistribution.dark = stat._count.theme
        if (stat.theme === 'auto') themeDistribution.auto = stat._count.theme
      }

      // Processar estatísticas de idioma
      const languageDistribution: { [key: string]: number } = {}
      for (const stat of languageStats) {
        languageDistribution[stat.language] = stat._count.language
      }

      // Processar estatísticas de moeda
      const currencyDistribution: { [key: string]: number } = {}
      for (const stat of currencyStats) {
        currencyDistribution[stat.currency] = stat._count.currency
      }

      // Processar estatísticas de notificações
      let notificationsEnabled = 0
      let notificationsDisabled = 0

      for (const stat of notificationsStats) {
        if (stat.emailNotifications) {
          notificationsEnabled = stat._count.emailNotifications
        } else {
          notificationsDisabled = stat._count.emailNotifications
        }
      }

      return {
        totalPreferences,
        themeDistribution,
        languageDistribution,
        currencyDistribution,
        averageItemsPerPage: Math.round(itemsPerPageStats._avg.itemsPerPage || 20),
        notificationsEnabled,
        notificationsDisabled,
      }
    } catch (error: any) {
      throw new Error(`Failed to get user preferences stats: ${error.message}`)
    }
  },

  // ================================
  // FILTER OPERATIONS
  // ================================

  async getByTheme(theme: string) {
    try {
      const preferences = await db.userPreferences.findMany({
        where: { theme },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences by theme: ${error.message}`)
    }
  },

  async getByLanguage(language: string) {
    try {
      const preferences = await db.userPreferences.findMany({
        where: { language },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences by language: ${error.message}`)
    }
  },

  async getByCurrency(currency: string) {
    try {
      const preferences = await db.userPreferences.findMany({
        where: { currency },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences by currency: ${error.message}`)
    }
  },

  async getWithCustomSettings() {
    try {
      const preferences = await db.userPreferences.findMany({
        where: {
          customSettings: {
            not: null,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return preferences
    } catch (error: any) {
      throw new Error(`Failed to get user preferences with custom settings: ${error.message}`)
    }
  },

  // ================================
  // VALIDATION OPERATIONS
  // ================================

  async validatePreferences(data: any) {
    try {
      const errors: string[] = []
      const warnings: string[] = []

      // Validar tema
      if (data.theme && !['light', 'dark', 'auto'].includes(data.theme)) {
        errors.push('Theme must be one of: light, dark, auto')
      }

      // Validar formato de data
      if (
        data.dateFormat &&
        !['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(data.dateFormat)
      ) {
        errors.push('Date format must be one of: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD')
      }

      // Validar formato de tempo
      if (data.timeFormat && !['12h', '24h'].includes(data.timeFormat)) {
        errors.push('Time format must be one of: 12h, 24h')
      }

      // Validar itemsPerPage
      if (data.itemsPerPage && (data.itemsPerPage < 5 || data.itemsPerPage > 100)) {
        warnings.push('Items per page should be between 5 and 100')
      }

      // Validar refreshInterval
      if (data.refreshInterval && (data.refreshInterval < 10 || data.refreshInterval > 300)) {
        warnings.push('Refresh interval should be between 10 and 300 seconds')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error: any) {
      throw new Error(`Failed to validate user preferences: ${error.message}`)
    }
  },
}
