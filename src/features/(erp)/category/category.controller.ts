import type { FastifyReply, FastifyRequest } from 'fastify'
import { CategoryCommands } from './commands/category.commands'
import { CategoryQueries } from './queries/category.queries'

export const CategoryController = {
  // === CRUD BÁSICO ===
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id
      const body = request.body as any

      const result = await CategoryCommands.create({
        ...body,
        storeId,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2002') {
        return reply.status(400).send({
          error: 'Category with this name or code already exists',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Invalid parent category reference',
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

      const result = await CategoryQueries.getById(id)

      if (!result) {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Category not found') {
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
      const updateData = request.body as any

      const result = await CategoryCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      if (error.code === 'P2002') {
        return reply.status(400).send({
          error: 'Category with this name or code already exists',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Invalid parent category reference',
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

      await CategoryCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Cannot delete category with children or products',
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
          error: 'Category IDs are required and must be a non-empty array',
        })
      }

      const result = await CategoryCommands.bulkDelete(ids)

      return reply.send({
        deleted: result.deleted,
        errors: result.errors,
        message: `Successfully deleted ${result.deleted} categories${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
      })
    } catch (error: any) {
      request.log.error(error)

      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, status, parentId } = request.query as any
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await CategoryQueries.list({
        page,
        limit,
        search,
        status,
        parentId,
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
  async getActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await CategoryQueries.getActive(request.store?.id)

      if (!result) {
        return reply.status(404).send({
          error: 'Categories not found',
        })
      }

      return reply.send({ categories: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await CategoryQueries.getStats(request.store?.id)

      if (!result) {
        return reply.status(404).send({
          error: 'Categories not found',
        })
      }

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async search(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { q, page = 1, limit = 10 } = request.query as any
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({
          error: 'Store context required',
        })
      }

      const result = await CategoryQueries.search(q, storeId, { page, limit })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getRootCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = request.query as any

      const result = await CategoryQueries.getRootCategories(status)

      return reply.send({ categories: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getChildren(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any

      const result = await CategoryQueries.getChildren(id, request.store?.id)

      return reply.send({ categories: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getHierarchy(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await CategoryQueries.getHierarchy(request.store?.id)

      return reply.send({ categories: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getByCode(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { code } = request.params as any

      const result = await CategoryQueries.getByCode(code, request.store?.id)

      if (!result) {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === FUNÇÕES ADICIONAIS (COMMANDS) ===
  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any

      const result = await CategoryCommands.updateStatus(id, status)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async moveToParent(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { parentId } = request.body as any

      const result = await CategoryCommands.moveToParent(id, parentId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'Category not found',
        })
      }

      if (error.code === 'P2003') {
        return reply.status(400).send({
          error: 'Invalid parent category reference',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === RELATÓRIOS ===
  async getTopCategoriesByProducts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        limit = 10,
        status,
        includeInactive = false,
        includeProductDetails = false,
      } = request.query as any

      const result = await CategoryQueries.getTopCategoriesByProductsWithDetails(
        request.store?.id,
        {
          limit: Number.parseInt(limit),
          status,
          includeInactive: includeInactive === 'true',
          includeProductDetails: includeProductDetails === 'true',
        }
      )

      return reply.send({
        categories: result,
        metadata: {
          total: result.length,
          limit: Number.parseInt(limit),
          description: 'Top categorias com mais produtos',
          chartType: 'horizontalBar',
          recommendedLimit: Math.min(Number.parseInt(limit), 10),
        },
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getCategoryCreationEvolution(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        period = 'month',
        startDate,
        endDate,
        status,
        includeInactive = false,
        includeDetails = false,
      } = request.query as any

      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined

      // Validar datas
      if (startDateObj && Number.isNaN(startDateObj.getTime())) {
        return reply.status(400).send({
          error: 'Data de início inválida',
        })
      }

      if (endDateObj && Number.isNaN(endDateObj.getTime())) {
        return reply.status(400).send({
          error: 'Data de fim inválida',
        })
      }

      if (startDateObj && endDateObj && startDateObj > endDateObj) {
        return reply.status(400).send({
          error: 'Data de início deve ser anterior à data de fim',
        })
      }

      const result = await CategoryQueries.getCategoryCreationEvolutionDetailed(request.store?.id, {
        period,
        startDate: startDateObj,
        endDate: endDateObj,
        status,
        includeInactive: includeInactive === 'true',
        includeDetails: includeDetails === 'true',
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getActiveInactiveRatio(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { includeDetails = false, includeHierarchy = false } = request.query as any

      const result = await CategoryQueries.getActiveInactiveRatio(request.store?.id, {
        includeDetails: includeDetails === 'true',
        includeHierarchy: includeHierarchy === 'true',
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async getActiveInactiveTrend(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { period = 'month', startDate, endDate } = request.query as any

      // Converter strings de data para Date se fornecidas
      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined

      // Validar datas
      if (startDateObj && Number.isNaN(startDateObj.getTime())) {
        return reply.status(400).send({
          error: 'Data de início inválida',
        })
      }

      if (endDateObj && Number.isNaN(endDateObj.getTime())) {
        return reply.status(400).send({
          error: 'Data de fim inválida',
        })
      }

      if (startDateObj && endDateObj && startDateObj > endDateObj) {
        return reply.status(400).send({
          error: 'Data de início deve ser anterior à data de fim',
        })
      }

      const result = await CategoryQueries.getActiveInactiveTrend(request.store?.id, {
        period,
        startDate: startDateObj,
        endDate: endDateObj,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
