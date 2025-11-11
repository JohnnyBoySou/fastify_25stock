import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { UserPreferencesController } from './user-preferences.controller'
import {
  createUserPreferencesSchema,
  deleteUserPreferencesSchema,
  getUserPreferencesByUserIdSchema,
  getUserPreferencesMeSchema,
  getUserPreferencesSchema,
  getUserPreferencesStatsSchema,
  listUserPreferencesSchema,
  searchUserPreferencesSchema,
  updateUserPreferencesMeSchema,
  updateUserPreferencesSchema,
  validateUserPreferencesSchema,
} from './user-preferences.schema'

// ================================
// USER PREFERENCES ROUTES
// ================================

export async function UserPreferencesRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)
  // CRUD básico
  fastify.post('/', {
    schema: createUserPreferencesSchema,
    handler: UserPreferencesController.create,
  })

  fastify.get('/', {
    schema: listUserPreferencesSchema,
    handler: UserPreferencesController.list,
  })

  fastify.get('/:id', {
    schema: getUserPreferencesSchema,
    handler: UserPreferencesController.get,
  })

  fastify.put('/:id', {
    schema: updateUserPreferencesSchema,
    handler: UserPreferencesController.update,
  })

  fastify.delete('/:id', {
    schema: deleteUserPreferencesSchema,
    handler: UserPreferencesController.delete,
  })

  // Funções específicas por usuário (usando ID do usuário autenticado)
  fastify.get('/me', {
    schema: getUserPreferencesMeSchema,
    handler: UserPreferencesController.getByUserId,
  })

  fastify.get('/me/or-create', {
    schema: getUserPreferencesMeSchema,
    handler: UserPreferencesController.getByUserIdOrCreate,
  })

  fastify.put('/me', {
    schema: updateUserPreferencesMeSchema,
    handler: UserPreferencesController.updateByUserId,
  })

  fastify.delete('/me', {
    schema: getUserPreferencesMeSchema,
    handler: UserPreferencesController.deleteByUserId,
  })

  // Funções de filtro e busca
  fastify.get('/theme/:theme', {
    handler: UserPreferencesController.getByTheme,
  })

  fastify.get('/language/:language', {
    handler: UserPreferencesController.getByLanguage,
  })

  fastify.get('/currency/:currency', {
    handler: UserPreferencesController.getByCurrency,
  })

  fastify.get('/custom-settings', {
    handler: UserPreferencesController.getWithCustomSettings,
  })

  // Funções de estatísticas e busca
  fastify.get('/stats', {
    schema: getUserPreferencesStatsSchema,
    handler: UserPreferencesController.getStats,
  })

  fastify.get('/search', {
    schema: searchUserPreferencesSchema,
    handler: UserPreferencesController.search,
  })

  // Funções de reset
  fastify.patch('/:id/reset', {
    schema: getUserPreferencesSchema,
    handler: UserPreferencesController.resetToDefaults,
  })

  fastify.patch('/me/reset', {
    schema: getUserPreferencesMeSchema,
    handler: UserPreferencesController.resetToDefaultsByUserId,
  })

  // Função de validação
  fastify.post('/validate', {
    schema: validateUserPreferencesSchema,
    handler: UserPreferencesController.validatePreferences,
  })
}
