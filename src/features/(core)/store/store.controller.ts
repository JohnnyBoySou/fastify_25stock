import type { FastifyReply } from 'fastify'
import { StoreCommands } from './commands/store.commands'
import { StoreQueries } from './queries/store.queries'
import type {
  CreateStoreRequest,
  DeleteStoreRequest,
  GetStoreRequest,
  UpdateStoreRequest,
} from './store.interfaces'

export const StoreController = {
  async create(request: CreateStoreRequest, reply: FastifyReply) {
    try {
      const { name, cnpj, email, phone, cep, city, state, address, status } = request.body
      const ownerId = request.user?.id

      const result = await StoreCommands.create({
        ownerId,
        name,
        cnpj,
        email,
        phone,
        cep,
        city,
        state,
        address,
        status,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'CNPJ already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.message === 'Owner not found') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: GetStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id

      const result = await StoreQueries.getById(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id
      const updateData = { ...request.body }

      const result = await StoreCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'CNPJ already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: DeleteStoreRequest, reply: FastifyReply) {
    try {
      const id = request.store?.id

      await StoreCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Store not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Cannot delete store with existing products') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
