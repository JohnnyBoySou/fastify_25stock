import type { FastifyReply, FastifyRequest } from 'fastify'
import { ProductCommands } from './commands/product.commands'
import type { VerifySkuRequest } from './product.interfaces'
import { ProductQueries } from './queries/product.queries'

export const ProductController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        name,
        description,
        unitOfMeasure,
        referencePrice,
        categoryIds,
        supplierId,
        storeId,
        stockMin,
        stockMax,
        alertPercentage,
        status,
      } = request.body as any

      // Se storeId não foi enviado, buscar a loja do usuário autenticado
      let finalStoreId = storeId
      if (!finalStoreId) {
        if (!request.user?.id) {
          return reply.status(401).send({
            error: 'Authentication required to determine store',
          })
        }

        finalStoreId = request.store?.id
      }

      const result = await ProductCommands.create({
        name,
        description,
        unitOfMeasure,
        referencePrice,
        categoryIds,
        supplierId,
        storeId: finalStoreId,
        stockMin,
        stockMax,
        alertPercentage,
        status,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product with this name already exists') {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.message.includes('Categories not found')) {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.message === 'User has no associated store') {
        return reply.status(400).send({
          error:
            'User has no associated store. Please provide a storeId or ensure user has access to a store.',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Invalid supplier or store reference',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async get(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await ProductQueries.getById(id, storeId)

      if (!result) {
        return reply.status(404).send({
          error: 'Product not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const updateData = { ...(request.body as any) }

      const result = await ProductCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Product not found',
        })
      }

      if (error.code === 'P2002') {
        return reply.status(400).send({
          error: 'Product with this name already exists',
        })
      }

      if (error.message.includes('Categories not found')) {
        return reply.status(400).send({
          error: error.message,
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Invalid supplier or store reference',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any

      await ProductCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      if (
        error.message.includes('Cannot delete product') &&
        error.message.includes('associated movements')
      ) {
        return reply.status(400).send({
          error: error.message,
          suggestion: 'Use DELETE /products/:id/force to delete the product and all its movements',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Cannot delete product due to foreign key constraints',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async forceDelete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any

      await ProductCommands.forceDelete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status, categoryIds, supplierId } = request.query as any
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await ProductQueries.list({
        page,
        limit,
        search,
        status,
        categoryIds: categoryIds
          ? Array.isArray(categoryIds)
            ? categoryIds
            : [categoryIds]
          : undefined,
        supplierId,
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

  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await ProductQueries.getActive(storeId)

      return reply.send({ products: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await ProductQueries.getStats(storeId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(
    request: FastifyRequest<{ Querystring: { q: string; limit?: number; page?: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { q, limit = 10, page = 1 } = request.query
      const storeId = request.store?.id

      const result = await ProductQueries.search(q, {
        page,
        limit,
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

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: boolean } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params
      const { status } = request.body

      const result = await ProductCommands.updateStatus(id, status)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Product not found',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async verifySku(request: VerifySkuRequest, reply: FastifyReply) {
    try {
      const { id: productId } = request.params
      const { sku } = request.body

      const result = await ProductCommands.verifySku(productId, sku)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async bulkDelete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { ids } = request.body as any

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return reply.status(400).send({
          error: 'Product IDs are required and must be a non-empty array',
        })
      }

      const result = await ProductCommands.bulkDelete(ids)

      return reply.send({
        deleted: result.deleted,
        errors: result.errors,
        message: `Successfully deleted ${result.deleted} products${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
      })
    } catch (error: any) {
      request.log.error(error)

      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
