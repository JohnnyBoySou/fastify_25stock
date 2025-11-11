import { db } from '@/plugins/prisma'
import { getLimitationByResource } from '../../../(core)/limitations/limitation.service'

export const CategoryQueries = {
  async getById(id: string) {
    return await db.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: boolean
    parentId?: string
    storeId?: string
  }) {
    const { page = 1, limit = 10, search, status, parentId, storeId } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (status !== undefined) {
      where.status = status
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        where.parentId = null
      } else {
        where.parentId = parentId
      }
    }

    // Filtrar categorias pela loja específica
    if (storeId) {
      where.storeId = storeId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
              status: true,
              color: true,
              icon: true,
            },
          },
          products: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  status: true,
                },
              },
            },
            take: 5,
          },
          _count: {
            select: {
              children: true,
              products: true,
            },
          },
        },
      }),
      db.category.count({ where }),
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

  async search(
    term: string,
    storeId: string,
    params: {
      page?: number
      limit?: number
    } = {}
  ) {
    const { page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const where: any = {
      storeId,
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
      ],
    }

    const [items, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
              status: true,
              color: true,
              icon: true,
            },
          },
          _count: {
            select: {
              children: true,
              products: true,
            },
          },
        },
      }),
      db.category.count({ where }),
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

  async getActive(storeId: string) {
    return await db.category.findMany({
      where: {
        status: true,
        storeId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async getStats(storeId: string) {
    const [total, active, inactive, withChildren, withoutChildren] = await Promise.all([
      db.category.count({ where: { storeId } }),
      db.category.count({ where: { status: true, storeId } }),
      db.category.count({ where: { status: false, storeId } }),
      db.category.count({
        where: {
          storeId,
          children: { some: {} },
        },
      }),
      db.category.count({
        where: {
          storeId,
          children: { none: {} },
        },
      }),
    ])

    return {
      total,
      active,
      inactive,
      withChildren,
      withoutChildren,
    }
  },

  async getRootCategories(storeId: string, status?: boolean) {
    const where: any = {
      parentId: null,
      storeId,
    }

    if (status !== undefined) {
      where.status = status
    }

    return await db.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async getChildren(parentId: string, storeId: string) {
    return await db.category.findMany({
      where: {
        parentId,
        storeId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async getHierarchy(storeId: string) {
    const rootCategories = await CategoryQueries.getRootCategories(storeId)

    const buildHierarchy = async (categories: any[]) => {
      for (const category of categories) {
        category.children = await CategoryQueries.getChildren(category.id, storeId)
        if (category.children.length > 0) {
          await buildHierarchy(category.children)
        }
      }
    }

    await buildHierarchy(rootCategories)
    return rootCategories
  },

  async getByCode(code: string, storeId: string) {
    return await db.category.findUnique({
      where: {
        code_storeId: {
          code,
          storeId,
        },
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            status: true,
            color: true,
            icon: true,
          },
        },
        products: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    })
  },

  async getTopCategoriesByProducts(
    storeId: string,
    params: {
      limit?: number
      status?: boolean
      includeInactive?: boolean
    }
  ) {
    const { limit = 10, status, includeInactive = false } = params

    const where: any = {
      storeId,
    }

    // Se não incluir inativas, filtrar apenas ativas
    if (!includeInactive) {
      where.status = status !== undefined ? status : true
    } else if (status !== undefined) {
      where.status = status
    }

    // Garantir que só retorne categorias que tenham produtos
    where.products = {
      some: {},
    }

    return await db.category.findMany({
      where,
      take: limit,
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        status: true,
        color: true,
        icon: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })
  },

  async getTopCategoriesByProductsWithDetails(
    storeId: string,
    params: {
      limit?: number
      status?: boolean
      includeInactive?: boolean
      includeProductDetails?: boolean
    }
  ) {
    const { limit = 10, status, includeInactive = false, includeProductDetails = false } = params

    const where: any = {
      storeId,
    }

    // Se não incluir inativas, filtrar apenas ativas
    if (!includeInactive) {
      where.status = status !== undefined ? status : true
    } else if (status !== undefined) {
      where.status = status
    }

    // Garantir que só retorne categorias que tenham produtos
    where.products = {
      some: {},
    }

    const include: any = {
      parent: {
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
        },
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    }

    // Incluir detalhes dos produtos se solicitado
    if (includeProductDetails) {
      include.products = {
        select: {
          id: true,
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              sku: true,
              price: true,
              stock: true,
            },
          },
        },
        take: 5, // Limitar a 5 produtos por categoria para não sobrecarregar
      }
    }

    return await db.category.findMany({
      where,
      take: limit,
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        status: true,
        color: true,
        icon: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        ...include,
      },
    })
  },

  async getCategoryCreationEvolution(
    storeId: string,
    params: {
      period?: 'day' | 'week' | 'month' | 'year'
      startDate?: Date
      endDate?: Date
      status?: boolean
      includeInactive?: boolean
    }
  ) {
    const { period = 'month', startDate, endDate, status, includeInactive = false } = params

    const where: any = {
      storeId,
    }

    // Filtro por status
    if (!includeInactive) {
      where.status = status !== undefined ? status : true
    } else if (status !== undefined) {
      where.status = status
    }

    // Filtro por data
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    // Buscar todas as categorias no período
    const categories = await db.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Agrupar por período
    const groupedData = CategoryQueries.groupByPeriod(categories, period)

    // Calcular estatísticas
    const totalCategories = categories.length
    const activeCategories = categories.filter((cat) => cat.status).length
    const inactiveCategories = totalCategories - activeCategories

    // Calcular crescimento
    const periods = Object.keys(groupedData).sort()
    const growthRate = CategoryQueries.calculateGrowthRate(groupedData, periods)

    return {
      data: groupedData,
      metadata: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        period,
        startDate: startDate || null,
        endDate: endDate || null,
        growthRate,
        description: `Evolução de criação de categorias por ${period}`,
        chartType: 'line',
      },
    }
  },

  async getCategoryCreationEvolutionDetailed(
    storeId: string,
    params: {
      period?: 'day' | 'week' | 'month' | 'year'
      startDate?: Date
      endDate?: Date
      status?: boolean
      includeInactive?: boolean
      includeDetails?: boolean
    }
  ) {
    const {
      period = 'month',
      startDate,
      endDate,
      status,
      includeInactive = false,
      includeDetails = false,
    } = params

    const where: any = {
      storeId,
    }

    // Filtro por status
    if (!includeInactive) {
      where.status = status !== undefined ? status : true
    } else if (status !== undefined) {
      where.status = status
    }

    // Filtro por data
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    const selectFields: any = {
      id: true,
      name: true,
      status: true,
      createdAt: true,
    }

    // Incluir detalhes adicionais se solicitado
    if (includeDetails) {
      selectFields.parent = {
        select: {
          id: true,
          name: true,
        },
      }
      selectFields._count = {
        select: {
          children: true,
          products: true,
        },
      }
    }

    // Buscar todas as categorias no período
    const categories = await db.category.findMany({
      where,
      select: selectFields,
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Agrupar por período
    const groupedData = CategoryQueries.groupByPeriod(categories, period)

    // Calcular estatísticas detalhadas
    const totalCategories = categories.length
    const activeCategories = categories.filter((cat) => cat.status).length
    const inactiveCategories = totalCategories - activeCategories

    // Calcular crescimento
    const periods = Object.keys(groupedData).sort()
    const growthRate = CategoryQueries.calculateGrowthRate(groupedData, periods)

    // Calcular estatísticas por período
    const periodStats = CategoryQueries.calculatePeriodStats(groupedData, periods)

    return {
      data: groupedData,
      periodStats,
      metadata: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        period,
        startDate: startDate || null,
        endDate: endDate || null,
        growthRate,
        description: `Evolução detalhada de criação de categorias por ${period}`,
        chartType: 'line',
      },
    }
  },

  // Métodos auxiliares privados
  groupByPeriod(categories: any[], period: string) {
    const grouped: Record<string, any[]> = {}

    for (const category of categories) {
      const date = new Date(category.createdAt)
      let key: string

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0] // YYYY-MM-DD
          break
        case 'week':
          {
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            key = weekStart.toISOString().split('T')[0]
          }
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = String(date.getFullYear())
          break
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(category)
    }

    // Converter para formato de dados do gráfico
    const chartData: { [key: string]: { count: number; categories: any[] } } = {}
    for (const key of Object.keys(grouped)) {
      chartData[key] = {
        count: grouped[key].length,
        categories: grouped[key],
      }
    }

    return chartData
  },

  calculateGrowthRate(groupedData: any, periods: string[]) {
    if (periods.length < 2) return 0

    const firstPeriod = periods[0]
    const lastPeriod = periods[periods.length - 1]

    const firstCount = groupedData[firstPeriod]?.count || 0
    const lastCount = groupedData[lastPeriod]?.count || 0

    if (firstCount === 0) return lastCount > 0 ? 100 : 0

    return ((lastCount - firstCount) / firstCount) * 100
  },

  calculatePeriodStats(groupedData: any, periods: string[]) {
    const stats = {
      averagePerPeriod: 0,
      maxPerPeriod: 0,
      minPerPeriod: Number.POSITIVE_INFINITY,
      totalPeriods: periods.length,
      periodsWithGrowth: 0,
      periodsWithDecline: 0,
      periodsStable: 0,
    }

    if (periods.length === 0) return stats

    let totalCount = 0
    let previousCount = 0

    periods.forEach((period, index) => {
      const count = groupedData[period]?.count || 0
      totalCount += count

      stats.maxPerPeriod = Math.max(stats.maxPerPeriod, count)
      stats.minPerPeriod = Math.min(stats.minPerPeriod, count)

      if (index > 0) {
        if (count > previousCount) {
          stats.periodsWithGrowth++
        } else if (count < previousCount) {
          stats.periodsWithDecline++
        } else {
          stats.periodsStable++
        }
      }

      previousCount = count
    })

    stats.averagePerPeriod = totalCount / periods.length
    stats.minPerPeriod = stats.minPerPeriod === Number.POSITIVE_INFINITY ? 0 : stats.minPerPeriod

    return stats
  },

  async getActiveInactiveRatio(
    storeId: string,
    params: {
      includeDetails?: boolean
      includeHierarchy?: boolean
    }
  ) {
    const { includeDetails = false, includeHierarchy = false } = params

    // Buscar contagem total de categorias ativas e inativas
    const [activeCount, inactiveCount, totalCount] = await Promise.all([
      db.category.count({ where: { status: true, storeId } }),
      db.category.count({ where: { status: false, storeId } }),
      db.category.count({ where: { storeId } }),
    ])

    // Calcular percentuais
    const activePercentage = totalCount > 0 ? (activeCount / totalCount) * 100 : 0
    const inactivePercentage = totalCount > 0 ? (inactiveCount / totalCount) * 100 : 0

    // Calcular taxa de "higiene" dos dados
    const hygieneScore = activePercentage // Quanto maior, melhor a higiene

    const result: any = {
      active: {
        count: activeCount,
        percentage: Math.round(activePercentage * 100) / 100,
      },
      inactive: {
        count: inactiveCount,
        percentage: Math.round(inactivePercentage * 100) / 100,
      },
      total: totalCount,
      hygieneScore: Math.round(hygieneScore * 100) / 100,
      metadata: {
        description: 'Taxa de categorias ativas vs inativas',
        chartType: 'donut',
        lastUpdated: new Date().toISOString(),
      },
    }

    // Incluir detalhes adicionais se solicitado
    if (includeDetails) {
      const [activeCategories, inactiveCategories] = await Promise.all([
        db.category.findMany({
          where: { status: true, storeId },
          select: {
            id: true,
            name: true,
            code: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Limitar para não sobrecarregar
        }),
        db.category.findMany({
          where: { status: false, storeId },
          select: {
            id: true,
            name: true,
            code: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                children: true,
                products: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10, // Limitar para não sobrecarregar
        }),
      ])

      result.active.recentCategories = activeCategories
      result.inactive.recentCategories = inactiveCategories
    }

    // Incluir análise hierárquica se solicitado
    if (includeHierarchy) {
      const [
        activeWithChildren,
        inactiveWithChildren,
        activeWithoutChildren,
        inactiveWithoutChildren,
      ] = await Promise.all([
        db.category.count({
          where: {
            storeId,
            status: true,
            children: { some: {} },
          },
        }),
        db.category.count({
          where: {
            storeId,
            status: false,
            children: { some: {} },
          },
        }),
        db.category.count({
          where: {
            storeId,
            status: true,
            children: { none: {} },
          },
        }),
        db.category.count({
          where: {
            storeId,
            status: false,
            children: { none: {} },
          },
        }),
      ])

      result.hierarchy = {
        activeWithChildren,
        inactiveWithChildren,
        activeWithoutChildren,
        inactiveWithoutChildren,
        totalWithChildren: activeWithChildren + inactiveWithChildren,
        totalWithoutChildren: activeWithoutChildren + inactiveWithoutChildren,
      }
    }

    return result
  },

  async getActiveInactiveTrend(
    storeId: string,
    params: {
      period?: 'day' | 'week' | 'month' | 'year'
      startDate?: Date
      endDate?: Date
    }
  ) {
    const { period = 'month', startDate, endDate } = params

    const where: any = {
      storeId,
    }

    // Filtro por data se fornecido
    if (startDate || endDate) {
      where.updatedAt = {}
      if (startDate) {
        where.updatedAt.gte = startDate
      }
      if (endDate) {
        where.updatedAt.lte = endDate
      }
    }

    // Buscar categorias com data de atualização no período
    const categories = await db.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    })

    // Agrupar por período e calcular tendência
    const groupedData = CategoryQueries.groupByPeriod(categories, period)
    const trendData: { [key: string]: { active: number; inactive: number; total: number } } = {}

    for (const periodKey of Object.keys(groupedData)) {
      const periodCategories = groupedData[periodKey].categories
      const active = periodCategories.filter((cat) => cat.status).length
      const inactive = periodCategories.filter((cat) => !cat.status).length

      trendData[periodKey] = {
        active,
        inactive,
        total: active + inactive,
      }
    }

    return {
      trendData,
      metadata: {
        period,
        startDate: startDate || null,
        endDate: endDate || null,
        description: `Tendência de categorias ativas vs inativas por ${period}`,
        chartType: 'line',
      },
    }
  },

  async checkLimitation(storeId: string) {
    const { limit } = await getLimitationByResource('categories', storeId)

    if (!limit) {
      return false
    }

    const count = await db.category.count({
      where: {
        storeId,
      },
    })

    if (count >= limit) {
      return false
    }

    return true
  },

 
}
