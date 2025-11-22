import type { FastifyInstance } from 'fastify'
import { PermissionController } from './permission.controller'
import { PermissionSchemas } from './permission.schema'
import { Middlewares } from '@/middlewares'

export async function PermissionRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.get('/', {
    handler: PermissionController.listAvailable,
  })

  fastify.get('/stats', {
    handler: PermissionController.getStats,
  })

  // GET /permissions/resource/:resource - Buscar por recurso
  fastify.get('/resource/:resource', {
    handler: PermissionController.getByResource,
  })

  // GET /permissions/action/:action - Buscar por ação
  fastify.get('/action/:action', {
    handler: PermissionController.getByAction,
  })

  // GET /permissions/resources - Listar recursos disponíveis
  fastify.get('/resources', {
    handler: PermissionController.getResources,
  })

  // GET /permissions/actions - Listar ações disponíveis
  fastify.get('/actions', {
    handler: PermissionController.getActions,
  })

  // ================================
  // ATRIBUIÇÃO DE PERMISSÕES A USUÁRIOS
  // ================================

  // POST /permissions/assign - Atribuir permissões a usuário
  fastify.post('/assign', {
    //preHandler: [Middlewares.permission('PERMISSIONS', 'UPDATE')],
    schema: PermissionSchemas.assignToUser,
    handler: PermissionController.assignToUser,
  })

  // POST /permissions/remove - Remover permissões de usuário
  fastify.post('/remove', {
    //preHandler: [Middlewares.permission('PERMISSIONS', 'UPDATE')],
    schema: PermissionSchemas.removeFromUser,
    handler: PermissionController.removeFromUser,
  })

  // DELETE /permissions/user/:userId/all - Remover todas as permissões de usuário
  fastify.delete('/user/:userId/all', {
    //preHandler: [Middlewares.permission('PERMISSIONS', 'UPDATE')],
    schema: PermissionSchemas.removeAllFromUser,
    handler: PermissionController.removeAllFromUser,
  })

  // POST /permissions/sync - Sincronizar permissões de usuário
  fastify.post('/sync', {
    //preHandler: [Middlewares.permission('PERMISSIONS', 'UPDATE')],
    schema: PermissionSchemas.syncUserPermissions,
    handler: PermissionController.syncUserPermissions,
  })

  // GET /permissions/user/:userId - Buscar permissões de usuário
  fastify.get('/user/:userId', {
    //preHandler: [Middlewares.permission('PERMISSIONS', 'READ')],
    schema: PermissionSchemas.getUserPermissions,
    handler: PermissionController.getUserPermissions,
  })

  // POST /permissions/check - Verificar se usuário tem permissão
  fastify.post('/check', {
    schema: PermissionSchemas.checkUserPermission,
    handler: PermissionController.checkUserPermission,
  })

  // GET /permissions/:resource/:action/users - Buscar usuários com permissão
  fastify.get('/:resource/:action/users', {
    handler: PermissionController.getUsersWithPermission,
  })

  fastify.get('/me', {
    handler: PermissionController.getMePermissions,
  })
}
