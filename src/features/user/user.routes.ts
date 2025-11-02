import type { FastifyInstance } from 'fastify'
import { UserController } from './user.controller'
import { UserSchemas } from './user.schema'

export async function UserRoutes(fastify: FastifyInstance) {
  // POST /users - Criar usuário
  fastify.post('/', {
    schema: UserSchemas.create,
    handler: UserController.create,
  })

  // GET /users - Listar usuários
  fastify.get('/', {
    schema: UserSchemas.list,
    handler: UserController.list,
  })

  // GET /users/:id - Buscar usuário por ID
  fastify.get('/:id', {
    schema: UserSchemas.get,
    handler: UserController.get,
  })

  // PUT /users/:id - Atualizar usuário
  fastify.put('/:id', {
    schema: UserSchemas.update,
    handler: UserController.update,
  })

  // DELETE /users/:id - Deletar usuário (soft delete)
  fastify.delete('/:id', {
    schema: UserSchemas.delete,
    handler: UserController.delete,
  })

  // GET /users/email - Buscar usuário por email
  fastify.get('/email', {
    handler: UserController.getByEmail,
  })

  // GET /users/active - Buscar usuários ativos
  fastify.get('/active', {
    handler: UserController.getActive,
  })

  // GET /users/stats - Estatísticas dos usuários
  fastify.get('/stats', {
    handler: UserController.getStats,
  })

  // GET /users/search - Buscar usuários
  fastify.get('/search', {
    handler: UserController.search,
  })

  // PATCH /users/:id/verify-email - Verificar email do usuário
  fastify.patch('/:id/verify-email', {
    handler: UserController.verifyEmail,
  })

  // PATCH /users/:id/last-login - Atualizar último login
  fastify.patch('/:id/last-login', {
    handler: UserController.updateLastLogin,
  })
}
