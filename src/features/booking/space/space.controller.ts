import type { FastifyReply, FastifyRequest } from 'fastify'
import { SpaceCommands } from './space.commands'
import { SpaceQueries } from './space.queries'
import type { CreateSpaceRequest, UpdateSpaceRequest } from './space.interfaces'

export const SpaceController = {
  async create(request: CreateSpaceRequest, reply: FastifyReply) {
    try {
      const { name, description, capacity, location } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      if (!request.user?.id) {
        return reply.status(401).send({
          error: 'Authentication required',
        })
      }

      const space = await SpaceCommands.create({
        name,
        description,
        capacity,
        location,
        storeId: request.store.id,
        createdById: request.user.id,
      })
      return reply.status(201).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const spaces = await SpaceQueries.getAll(request.store.id)
      return reply.status(200).send(spaces)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const space = await SpaceQueries.getById(id, request.store.id)

      if (!space) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      return reply.status(200).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async update(request: UpdateSpaceRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const { name, description, capacity, location } = request.body as {
        name?: string
        description?: string
        capacity?: number
        location?: string
      }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o space pertence à loja
      const existingSpace = await SpaceQueries.getById(id, request.store.id)
      if (!existingSpace) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      const space = await SpaceCommands.update(id, {
        name,
        description,
        capacity,
        location,
      })
      return reply.status(200).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o space pertence à loja
      const existingSpace = await SpaceQueries.getById(id, request.store.id)
      if (!existingSpace) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      const space = await SpaceCommands.remove(id)
      return reply.status(200).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getByQuery(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { query } = request.query as { query?: any }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const spaces = await SpaceQueries.getByQuery(query, request.store.id)
      return reply.status(200).send(spaces)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
