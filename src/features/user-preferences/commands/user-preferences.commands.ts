import { db } from '@/plugins/prisma'
import type { UserPreferencesData } from '../user-preferences.interfaces'
// ================================
// USER PREFERENCES COMMANDS
// ================================

export const UserPreferencesCommands = {
  async create(data: UserPreferencesData & { userId: string }) {
    try {
      // Verificar se o usuário existe
      const user = await db.user.findUnique({
        where: { id: data.userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verificar se já existe preferências para este usuário
      const existingPreferences = await db.userPreferences.findUnique({
        where: { userId: data.userId },
      })

      if (existingPreferences) {
        throw new Error('User preferences already exist for this user')
      }

      // Criar as preferências
      const preferences = await db.userPreferences.create({
        data: {
          userId: data.userId,
          theme: data.theme || 'light',
          primaryColor: data.primaryColor,
          sidebarCollapsed: data.sidebarCollapsed || false,
          compactMode: data.compactMode || false,
          language: data.language || 'pt-BR',
          currency: data.currency || 'BRL',
          timezone: data.timezone || 'America/Sao_Paulo',
          dateFormat: data.dateFormat || 'DD/MM/YYYY',
          timeFormat: data.timeFormat || '24h',
          numberFormat: data.numberFormat || 'pt-BR',
          emailNotifications:
            data.emailNotifications !== undefined ? data.emailNotifications : true,
          pushNotifications: data.pushNotifications !== undefined ? data.pushNotifications : true,
          smsNotifications: data.smsNotifications || false,
          notificationTypes: data.notificationTypes,
          dashboardLayout: data.dashboardLayout,
          defaultPage: data.defaultPage,
          itemsPerPage: data.itemsPerPage || 20,
          autoRefresh: data.autoRefresh !== undefined ? data.autoRefresh : true,
          refreshInterval: data.refreshInterval || 30,
          customSettings: data.customSettings,
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
      throw new Error(`Failed to create user preferences: ${error.message}`)
    }
  },

  // ================================
  // UPDATE OPERATIONS
  // ================================

  async update(id: string, data: Partial<UserPreferencesData>) {
    try {
      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { id },
      })

      if (!existingPreferences) {
        throw new Error('User preferences not found')
      }

      // Atualizar as preferências
      const updatedPreferences = await db.userPreferences.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
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

      return updatedPreferences
    } catch (error: any) {
      throw new Error(`Failed to update user preferences: ${error.message}`)
    }
  },

  async updateByUserId(userId: string, data: Partial<UserPreferencesData>) {
    try {
      // Verificar se o usuário existe
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { userId },
      })

      if (!existingPreferences) {
        // Se não existir, criar com os dados fornecidos
        return await UserPreferencesCommands.create({ ...data, userId })
      }

      // Atualizar as preferências existentes
      const updatedPreferences = await db.userPreferences.update({
        where: { userId },
        data: {
          ...data,
          updatedAt: new Date(),
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

      return updatedPreferences
    } catch (error: any) {
      throw new Error(`Failed to update user preferences: ${error.message}`)
    }
  },

  // ================================
  // DELETE OPERATIONS
  // ================================

  async delete(id: string) {
    try {
      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { id },
      })

      if (!existingPreferences) {
        throw new Error('User preferences not found')
      }

      // Deletar as preferências
      await db.userPreferences.delete({
        where: { id },
      })

      return { success: true, message: 'User preferences deleted successfully' }
    } catch (error: any) {
      throw new Error(`Failed to delete user preferences: ${error.message}`)
    }
  },

  async deleteByUserId(userId: string) {
    try {
      // Verificar se o usuário existe
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { userId },
      })

      if (!existingPreferences) {
        throw new Error('User preferences not found')
      }

      // Deletar as preferências
      await db.userPreferences.delete({
        where: { userId },
      })

      return { success: true, message: 'User preferences deleted successfully' }
    } catch (error: any) {
      throw new Error(`Failed to delete user preferences: ${error.message}`)
    }
  },

  // ================================
  // RESET OPERATIONS
  // ================================

  async resetToDefaults(id: string) {
    try {
      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { id },
      })

      if (!existingPreferences) {
        throw new Error('User preferences not found')
      }

      // Resetar para valores padrão
      const resetPreferences = await db.userPreferences.update({
        where: { id },
        data: {
          theme: 'light',
          primaryColor: null,
          sidebarCollapsed: false,
          compactMode: false,
          language: 'pt-BR',
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          numberFormat: 'pt-BR',
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          notificationTypes: null,
          dashboardLayout: null,
          defaultPage: null,
          itemsPerPage: 20,
          autoRefresh: true,
          refreshInterval: 30,
          customSettings: null,
          updatedAt: new Date(),
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

      return resetPreferences
    } catch (error: any) {
      throw new Error(`Failed to reset user preferences: ${error.message}`)
    }
  },

  async resetToDefaultsByUserId(userId: string) {
    try {
      // Verificar se o usuário existe
      const user = await db.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verificar se as preferências existem
      const existingPreferences = await db.userPreferences.findUnique({
        where: { userId },
      })

      if (!existingPreferences) {
        throw new Error('User preferences not found')
      }

      // Resetar para valores padrão
      const resetPreferences = await db.userPreferences.update({
        where: { userId },
        data: {
          theme: 'light',
          primaryColor: null,
          sidebarCollapsed: false,
          compactMode: false,
          language: 'pt-BR',
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          numberFormat: 'pt-BR',
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          notificationTypes: null,
          dashboardLayout: null,
          defaultPage: null,
          itemsPerPage: 20,
          autoRefresh: true,
          refreshInterval: 30,
          customSettings: null,
          updatedAt: new Date(),
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

      return resetPreferences
    } catch (error: any) {
      throw new Error(`Failed to reset user preferences: ${error.message}`)
    }
  },

  // ================================
  // BULK OPERATIONS
  // ================================

  async bulkUpdate(filters: any, data: Partial<UserPreferencesData>) {
    try {
      const result = await db.userPreferences.updateMany({
        where: filters,
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        count: result.count,
        message: `${result.count} user preferences updated successfully`,
      }
    } catch (error: any) {
      throw new Error(`Failed to bulk update user preferences: ${error.message}`)
    }
  },

  async bulkDelete(filters: any) {
    try {
      const result = await db.userPreferences.deleteMany({
        where: filters,
      })

      return {
        success: true,
        count: result.count,
        message: `${result.count} user preferences deleted successfully`,
      }
    } catch (error: any) {
      throw new Error(`Failed to bulk delete user preferences: ${error.message}`)
    }
  },
}
