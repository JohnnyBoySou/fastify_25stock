import type { FastifyReply, FastifyRequest } from 'fastify'
import { UserPreferencesCommands } from './commands/user-preferences.commands'
import { UserPreferencesQueries } from './queries/user-preferences.query'
import type {
  CreateUserPreferencesRequest,
  DeleteUserPreferencesRequest,
  GetUserPreferencesByUserIdRequest,
  GetUserPreferencesRequest,
  ListUserPreferencesRequest,
  UpdateUserPreferencesRequest,
  UserPreferencesData,
} from './user-preferences.interfaces'

// ================================
// USER PREFERENCES CONTROLLER
// ================================

export const UserPreferencesController = {
  // === CRUD BÁSICO ===
  async create(request: CreateUserPreferencesRequest, reply: FastifyReply) {
    try {
      const preferencesData = request.body

      const result = await UserPreferencesCommands.create(preferencesData)

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'User preferences already exist for this user') {
        return reply.status(409).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetUserPreferencesRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await UserPreferencesQueries.getById(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateUserPreferencesRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await UserPreferencesCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteUserPreferencesRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await UserPreferencesCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: ListUserPreferencesRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, theme, language, currency } = request.query

      const result = await UserPreferencesQueries.list({
        page,
        limit,
        search,
        theme,
        language,
        currency,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (QUERIES) ===
  async getByUserId(request: GetUserPreferencesByUserIdRequest, reply: FastifyReply) {
    try {
      // Usar o ID do usuário autenticado em vez do parâmetro da URL
      const userId = request.user?.id

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      const result = await UserPreferencesQueries.getByUserId(userId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByUserIdOrCreate(request: GetUserPreferencesByUserIdRequest, reply: FastifyReply) {
    try {
      // Usar o ID do usuário autenticado em vez do parâmetro da URL
      const userId = request.user?.id

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      const result = await UserPreferencesQueries.getByUserIdOrCreate(userId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async updateByUserId(
    request: FastifyRequest<{ Params: { userId: string }; Body: any }>,
    reply: FastifyReply
  ) {
    try {
      // Usar o ID do usuário autenticado em vez do parâmetro da URL
      const userId = request.user?.id

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      const updateData = request.body as UserPreferencesData

      const result = await UserPreferencesCommands.updateByUserId(userId, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async deleteByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Usar o ID do usuário autenticado em vez do parâmetro da URL
      const userId = request.user?.id

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      await UserPreferencesCommands.deleteByUserId(userId)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found' || error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByTheme(
    request: FastifyRequest<{ Querystring: { theme: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { theme } = request.query

      const result = await UserPreferencesQueries.getByTheme(theme)

      return reply.send({ preferences: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByLanguage(
    request: FastifyRequest<{ Querystring: { language: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { language } = request.query

      const result = await UserPreferencesQueries.getByLanguage(language)

      return reply.send({ preferences: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByCurrency(
    request: FastifyRequest<{ Querystring: { currency: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { currency } = request.query

      const result = await UserPreferencesQueries.getByCurrency(currency)

      return reply.send({ preferences: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getWithCustomSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await UserPreferencesQueries.getWithCustomSettings()

      return reply.send({ preferences: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await UserPreferencesQueries.getStats()

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(
    request: FastifyRequest<{ Querystring: { q: string; limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { q, limit = 10 } = request.query

      const result = await UserPreferencesQueries.search(q, limit)

      return reply.send({ preferences: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async resetToDefaults(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await UserPreferencesCommands.resetToDefaults(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async resetToDefaultsByUserId(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      // Usar o ID do usuário autenticado em vez do parâmetro da URL
      const userId = request.user?.id

      if (!userId) {
        return reply.status(401).send({
          error: 'User not authenticated',
        })
      }

      const result = await UserPreferencesCommands.resetToDefaultsByUserId(userId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found' || error.message === 'User preferences not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async validatePreferences(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
    try {
      const preferencesData = request.body

      const result = await UserPreferencesQueries.validatePreferences(preferencesData)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
