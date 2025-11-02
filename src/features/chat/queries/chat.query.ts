import { CategoryQueries } from '@/features/category/queries/category.queries'
import { MovementQueries } from '@/features/movement/queries/movement.queries'
import { ProductQueries } from '@/features/product/queries/product.queries'
import { SupplierQueries } from '@/features/supplier/queries/supplier.queries'
import { db } from '@/plugins/prisma'

// Toolbox para acesso aos serviços do sistema
export const ChatToolbox = {
  // === SERVIÇOS DE PRODUTOS ===
  async getProducts(params: any) {
    return await ProductQueries.list(params)
  },

  async getProductById(id: string, storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for product queries')
    }
    return await ProductQueries.getById(id, storeId)
  },

  async searchProducts(
    term: string,
    params: {
      page?: number
      limit?: number
      storeId?: string
    } = {}
  ) {
    return await ProductQueries.search(term, params)
  },

  async getActiveProducts(storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for product queries')
    }
    return await ProductQueries.getActive(storeId)
  },

  async getProductStats(storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for product queries')
    }
    return await ProductQueries.getStats(storeId)
  },

  // === SERVIÇOS DE CATEGORIAS ===
  async getCategories(params: any) {
    return await CategoryQueries.list(params)
  },

  async getCategoryById(id: string) {
    return await CategoryQueries.getById(id)
  },

  async searchCategories(term: string, limit = 10, storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for category queries')
    }
    return await CategoryQueries.search(term, storeId, { limit })
  },

  async getActiveCategories(storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for category queries')
    }
    return await CategoryQueries.getActive(storeId)
  },

  async getCategoryStats(storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for category queries')
    }
    return await CategoryQueries.getStats(storeId)
  },

  async getCategoryHierarchy(storeId?: string) {
    if (!storeId) {
      throw new Error('Store ID is required for category queries')
    }
    return await CategoryQueries.getHierarchy(storeId)
  },

  // === SERVIÇOS DE FORNECEDORES ===
  async getSuppliers(params: any) {
    return await SupplierQueries.list(params)
  },

  async getSupplierById(id: string) {
    return await SupplierQueries.getById(id)
  },

  async searchSuppliers(term: string, limit = 10) {
    return await SupplierQueries.search(term, String(limit))
  },

  async getActiveSuppliers() {
    return await SupplierQueries.getActive()
  },

  async getSupplierStats() {
    return await SupplierQueries.getStats()
  },

  // === SERVIÇOS DE MOVIMENTAÇÕES ===
  async getMovements(params: any) {
    return await MovementQueries.list(params)
  },

  async getMovementById(id: string) {
    return await MovementQueries.getById(id)
  },

  async getMovementStats() {
    return await MovementQueries.getStats()
  },

  // === MÉTODO PARA EXECUTAR COMANDOS DINÂMICOS ===
  async executeCommand(command: string, params: any = {}) {
    const [service, method] = command.split('.')

    switch (service) {
      case 'products':
        return await this.executeProductCommand(method, params)
      case 'categories':
        return await this.executeCategoryCommand(method, params)
      case 'suppliers':
        return await this.executeSupplierCommand(method, params)
      case 'movements':
        return await this.executeMovementCommand(method, params)
      default:
        throw new Error(`Unknown service: ${service}`)
    }
  },

  async executeProductCommand(method: string, params: any) {
    switch (method) {
      case 'list':
        return await this.getProducts(params)
      case 'getById':
        return await this.getProductById(params.id, params.storeId)
      case 'search':
        return await this.searchProducts(params.term, params.limit)
      case 'getActive':
        return await this.getActiveProducts()
      case 'getStats':
        return await this.getProductStats()
      default:
        throw new Error(`Unknown product method: ${method}`)
    }
  },

  async executeCategoryCommand(method: string, params: any) {
    switch (method) {
      case 'list':
        return await this.getCategories(params)
      case 'getById':
        return await this.getCategoryById(params.id)
      case 'search':
        return await this.searchCategories(params.term, params.limit)
      case 'getActive':
        return await this.getActiveCategories()
      case 'getStats':
        return await this.getCategoryStats()
      case 'getHierarchy':
        return await this.getCategoryHierarchy()
      default:
        throw new Error(`Unknown category method: ${method}`)
    }
  },

  async executeSupplierCommand(method: string, params: any) {
    switch (method) {
      case 'list':
        return await this.getSuppliers(params)
      case 'getById':
        return await this.getSupplierById(params.id)
      case 'search':
        return await this.searchSuppliers(params.term, params.limit)
      case 'getActive':
        return await this.getActiveSuppliers()
      case 'getStats':
        return await this.getSupplierStats()
      default:
        throw new Error(`Unknown supplier method: ${method}`)
    }
  },

  async executeMovementCommand(method: string, params: any) {
    switch (method) {
      case 'list':
        return await this.getMovements(params)
      case 'getById':
        return await this.getMovementById(params.id)
      case 'getStats':
        return await this.getMovementStats()
      default:
        throw new Error(`Unknown movement method: ${method}`)
    }
  },
}

export const ChatQueries = {
  async getById(id: string) {
    const chatMessage = await db.chatMessage.findUnique({
      where: { id },
      include: {
        session: {
          select: {
            id: true,
            userId: true,
            storeId: true,
            title: true,
          },
        },
      },
    })

    if (!chatMessage) {
      throw new Error('Chat message not found')
    }

    return chatMessage
  },

  async list(params: {
    page?: number
    limit?: number
    sessionId?: string
    userId?: string
    storeId?: string
  }) {
    const { page = 1, limit = 10, sessionId, userId, storeId } = params
    const skip = (page - 1) * Number(limit)
    const takeLimit = Number(limit)

    const where: any = {}

    if (sessionId) {
      where.sessionId = sessionId
    }

    if (userId) {
      where.session = {
        userId,
      }
    }

    if (storeId) {
      where.session = {
        ...where.session,
        storeId,
      }
    }

    const [items, total] = await Promise.all([
      db.chatMessage.findMany({
        where,
        skip,
        take: takeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            select: {
              id: true,
              userId: true,
              storeId: true,
              title: true,
            },
          },
        },
      }),
      db.chatMessage.count({ where }),
    ])

    // Transformar dados para formato mais claro
    const formattedItems = items.map((item) => ({
      id: item.id,
      interaction: {
        user: {
          message: item.content,
          timestamp: item.createdAt,
        },
        ai: {
          response: item.content,
          timestamp: item.createdAt,
        },
      },
      context: item.context,
      options: item.options,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      session: item.session,
    }))

    return {
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  // === FORMATO TRADICIONAL (compatibilidade) ===
  async listTraditional(params: {
    page?: number
    limit?: number
    sessionId?: string
    userId?: string
    storeId?: string
  }) {
    const { page = 1, limit = 10, sessionId, userId, storeId } = params
    const skip = (page - 1) * Number(limit)
    const takeLimit = Number(limit)

    const where: any = {}

    if (sessionId) {
      where.sessionId = sessionId
    }

    if (userId) {
      where.session = {
        userId,
      }
    }

    if (storeId) {
      where.session = {
        ...where.session,
        storeId,
      }
    }

    const [items, total] = await Promise.all([
      db.chatMessage.findMany({
        where,
        skip,
        take: takeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            select: {
              id: true,
              userId: true,
              storeId: true,
              title: true,
            },
          },
        },
      }),
      db.chatMessage.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getSessionById(
    sessionId: string,
    params?: {
      page?: number
      limit?: number
    }
  ) {
    const { page = 1, limit = 20 } = params || {}
    const skip = (page - 1) * Number(limit)
    const takeLimit = Number(limit)

    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
          skip,
          take: takeLimit,
        },
      },
    })

    if (!session) {
      throw new Error('Chat session not found')
    }

    // Contar total de mensagens da sessão
    const totalMessages = await db.chatMessage.count({
      where: { sessionId },
    })

    // Transformar mensagens para formato cronológico com identificação
    const formattedMessages: any[] = []

    for (const message of session.messages as unknown as any[]) {
      // Adicionar mensagem do usuário
      formattedMessages.push({
        id: `${message.id}_user`,
        content: message.content,
        role: message.role,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })

      // Adicionar resposta da IA
      formattedMessages.push({
        id: `${message.id}_ai`,
        content: message.content,
        isUser: false,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })
    }

    return {
      id: session.id,
      userId: session.userId,
      storeId: session.storeId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    }
  },

  async getSessions(params: {
    page?: number
    limit?: number
    userId?: string
    storeId?: string
  }) {
    const { page = 1, limit = 10, userId, storeId } = params
    const skip = (page - 1) * Number(limit)
    const takeLimit = Number(limit)

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (storeId) {
      where.storeId = storeId
    }

    const [items, total] = await Promise.all([
      db.chatSession.findMany({
        where,
        skip,
        take: takeLimit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),
      db.chatSession.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getToolbox() {
    return {
      availableServices: {
        products: {
          description: 'Serviços para gerenciar produtos, estoque e categorias',
          methods: [
            'products.list - Listar produtos com filtros',
            'products.getById - Buscar produto por ID',
            'products.search - Buscar produtos por termo',
            'products.getActive - Listar produtos ativos',
            'products.getStats - Estatísticas de produtos',
          ],
        },
        stores: {
          description: 'Serviços para gerenciar lojas e usuários',
          methods: [
            'stores.list - Listar lojas com filtros',
            'stores.getById - Buscar loja por ID',
            'stores.search - Buscar lojas por termo',
            'stores.getActive - Listar lojas ativas',
            'stores.getStats - Estatísticas de lojas',
          ],
        },
        categories: {
          description: 'Serviços para gerenciar categorias de produtos',
          methods: [
            'categories.list - Listar categorias com filtros',
            'categories.getById - Buscar categoria por ID',
            'categories.search - Buscar categorias por termo',
            'categories.getActive - Listar categorias ativas',
            'categories.getStats - Estatísticas de categorias',
            'categories.getHierarchy - Hierarquia de categorias',
          ],
        },
        suppliers: {
          description: 'Serviços para gerenciar fornecedores',
          methods: [
            'suppliers.list - Listar fornecedores com filtros',
            'suppliers.getById - Buscar fornecedor por ID',
            'suppliers.search - Buscar fornecedores por termo',
            'suppliers.getActive - Listar fornecedores ativos',
            'suppliers.getStats - Estatísticas de fornecedores',
          ],
        },
        movements: {
          description: 'Serviços para gerenciar movimentações de estoque',
          methods: [
            'movements.list - Listar movimentações com filtros',
            'movements.getById - Buscar movimentação por ID',
            'movements.getStats - Estatísticas de movimentações',
            'movements.getRecent - Movimentações recentes',
          ],
        },
        reports: {
          description: 'Serviços para gerenciar relatórios',
          methods: [
            'reports.list - Listar relatórios com filtros',
            'reports.getById - Buscar relatório por ID',
            'reports.getStats - Estatísticas de relatórios',
          ],
        },
      },
    }
  },

  async getAnalytics(params: {
    startDate?: string
    endDate?: string
    userId?: string
    storeId?: string
  }) {
    const { startDate, endDate, userId, storeId } = params

    const where: any = {}

    if (userId) {
      where.session = {
        userId,
      }
    }

    if (storeId) {
      where.session = {
        ...where.session,
        storeId,
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [totalMessages, totalSessions, messagesByDay] = await Promise.all([
      db.chatMessage.count({ where }),
      db.chatSession.count({
        where: userId ? { userId } : storeId ? { storeId } : {},
      }),
      db.chatMessage.groupBy({
        by: ['createdAt'],
        where,
        _count: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ])

    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0

    return {
      totalMessages,
      totalSessions,
      averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
      mostUsedServices: [], // Implementar análise de serviços mais usados
      messagesByDay: messagesByDay.map((item) => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id,
      })),
    }
  },

  async search(term: string, limit = 10) {
    const messages = await db.chatMessage.findMany({
      where: {
        OR: [{ content: { contains: term, mode: 'insensitive' } }],
      },
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          select: {
            id: true,
            userId: true,
            storeId: true,
            title: true,
          },
        },
      },
    })

    return messages
  },
}
