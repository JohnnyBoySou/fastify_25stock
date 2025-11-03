import type { FastifyReply, FastifyRequest } from 'fastify'
import { UserCommands } from './commands/user.commands'
import { UserQueries } from './querys/user.query'
import type {
  CreateUserRequest,
  DeleteUserRequest,
  GetUserRequest,
  ListUsersRequest,
  UpdateUserRequest,
} from './user.interfaces'

export const UserController = {
  async create(request: CreateUserRequest, reply: FastifyReply) {
    try {
      const { email, name } = request.body

      const user = await UserCommands.create({
        email,
        name,
      })

      return reply.status(201).send(user)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User with this email already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const user = await UserQueries.getById(id)

      return reply.send(user)
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

  async update(request: UpdateUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const user = await UserCommands.update(id, updateData)

      return reply.send(user)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'User not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Email already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteUserRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await UserCommands.delete(id)

      return reply.status(204).send()
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

  async list(request: ListUsersRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status } = request.query

      const result = await UserQueries.list({
        page,
        limit,
        search,
        status,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // Funções adicionais usando queries
  async getByEmail(
    request: FastifyRequest<{ Querystring: { email: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.query

      const user = await UserQueries.getByEmail(email)

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
        })
      }

      return reply.send(user)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await UserQueries.getActive()

      return reply.send({ users })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await UserQueries.getStats()

      return reply.send(stats)
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

      const users = await UserQueries.search(q, limit)

      return reply.send({ users })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // Funções adicionais usando commands
  async verifyEmail(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const user = await UserCommands.verifyEmail(id)

      return reply.send(user)
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

  async updateLastLogin(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      await UserCommands.updateLastLogin(id)

      return reply.send({ success: true })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
