import type { FastifyReply, FastifyRequest } from 'fastify'
import { SupplierCommands } from './commands/supplier.commands'
import { SupplierQueries } from './queries/supplier.queries'
import type {
  CreateSupplierRequest,
  DeleteSupplierRequest,
  GetSupplierByCnpjRequest,
  GetSupplierRequest,
  GetSuppliersByCityRequest,
  GetSuppliersByStateRequest,
  ListSuppliersRequest,
  SearchSuppliersRequest,
  UpdateSupplierRequest,
} from './supplier.interfaces'

export const SupplierController = {
  // === CRUD BÁSICO ===
  async create(request: CreateSupplierRequest, reply: FastifyReply) {
    try {
      const { corporateName, cnpj, tradeName, cep, city, state, address, storeId, responsibles } =
        request.body
      const contextStoreId = request.store?.id

      const result = await SupplierCommands.create({
        corporateName,
        cnpj,
        tradeName,
        cep,
        city,
        state,
        address,
        storeId: storeId || contextStoreId,
        responsibles,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

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

  async get(request: GetSupplierRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await SupplierQueries.getById(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Supplier not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: UpdateSupplierRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await SupplierCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Supplier not found') {
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

  async delete(request: DeleteSupplierRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await SupplierCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Supplier not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (error.message === 'Cannot delete supplier with associated products') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: ListSuppliersRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await SupplierQueries.list({
        page,
        limit,
        search,
        status,
        storeId,
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
  async getByCnpj(request: GetSupplierByCnpjRequest, reply: FastifyReply) {
    try {
      const { cnpj } = request.params
      const storeId = request.store?.id

      const result = await SupplierQueries.getByCnpj(cnpj, storeId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Supplier not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByCity(request: GetSuppliersByCityRequest, reply: FastifyReply) {
    try {
      const { city } = request.params

      const result = await SupplierQueries.getByCity(city)

      return reply.send({ suppliers: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByState(request: GetSuppliersByStateRequest, reply: FastifyReply) {
    try {
      const { state } = request.params

      const result = await SupplierQueries.getByState(state)

      return reply.send({ suppliers: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await SupplierQueries.getActive()

      return reply.send({ suppliers: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await SupplierQueries.getStats()

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(request: SearchSuppliersRequest, reply: FastifyReply) {
    try {
      const { search, page = 1, limit = 10 } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await SupplierQueries.search(search, storeId, { page, limit })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getTopSuppliers(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { limit = 5 } = request.query

      const result = await SupplierQueries.getTopSuppliers(limit)

      return reply.send({ suppliers: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async toggleStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await SupplierCommands.toggleStatus(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Supplier not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
