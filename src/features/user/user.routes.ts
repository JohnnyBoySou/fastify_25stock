import type { FastifyInstance } from 'fastify'
import { UserController } from './user.controller'
import { UserSchemas } from './user.schema'

export async function UserRoutes(fastify: FastifyInstance) {
  fastify.post('/', {
    schema: UserSchemas.create,
    handler: UserController.create,
  })

  fastify.get('/', {
    schema: UserSchemas.list,
    handler: UserController.list,
  })

  fastify.get('/:id', {
    schema: UserSchemas.get,
    handler: UserController.get,
  })

  fastify.put('/:id', {
    schema: UserSchemas.update,
    handler: UserController.update,
  })

  fastify.delete('/:id', {
    schema: UserSchemas.delete,
    handler: UserController.delete,
  })

  fastify.delete('/bulk-delete', {
    schema: UserSchemas.bulkDelete,
    handler: UserController.bulkDelete,
  })

  fastify.get('/email', {
    handler: UserController.getByEmail,
  })

  fastify.get('/active', {
    handler: UserController.getActive,
  })

  fastify.get('/stats', {
    handler: UserController.getStats,
  })

  fastify.get('/search', {
    handler: UserController.search,
  })

  fastify.patch('/:id/verify-email', {
    handler: UserController.verifyEmail,
  })

  fastify.patch('/:id/last-login', {
    handler: UserController.updateLastLogin,
  })
}
