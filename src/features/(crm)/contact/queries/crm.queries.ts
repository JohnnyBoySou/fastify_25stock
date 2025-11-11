import { db } from '@/plugins/prisma'

export const CrmQueries = {
  async getById(id: string, storeId: string) {
    return await db.crmClient.findFirst({
      where: {
        id,
        storeId,
      },
      include: {
        stage: true,
      },
    })
  },

  async list(
    params: {
      page?: number
      limit?: number
      search?: string
      stageId?: string
    },
    storeId: string
  ) {
    const { page = 1, limit = 10, search, stageId } = params
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    console.log('🔍 DEBUG list: params:', { page, limit, skip, take, search, stageId })

    const where: any = {
      storeId,
    }

    if (stageId) {
      where.stageId = stageId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { cpfCnpj: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      db.crmClient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          stage: true,
        },
      }),
      db.crmClient.count({ where }),
    ])

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }
  },

  async listGroupedByStage(storeId: string) {
    console.log('🔍 DEBUG listGroupedByStage: Starting with storeId:', storeId)

    try {
      // Buscar todos os stages da store ordenados
      console.log('📊 Searching for stages...')
      const stages = await db.crmStage.findMany({
        where: { storeId },
        orderBy: { order: 'asc' },
        include: {
          clients: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      console.log('✅ Found stages:', stages.length)
      console.log('📋 Stages data:', JSON.stringify(stages, null, 2))

      // Buscar clientes sem stage
      console.log('📊 Searching for clients without stage...')
      const clientsWithoutStage = await db.crmClient.findMany({
        where: {
          storeId,
          stageId: null,
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log('✅ Found clients without stage:', clientsWithoutStage.length)

      // Adicionar stage virtual para clientes sem stage apenas se houver clientes
      const stagesWithClients = [...stages]

      if (clientsWithoutStage.length > 0) {
        console.log('📝 Adding virtual stage for clients without stage')
        stagesWithClients.push({
          id: null,
          name: 'Sem Stage',
          color: '#6B7280',
          order: -1,
          createdAt: new Date(),
          storeId: storeId,
          clients: clientsWithoutStage,
        } as any)
      }

      console.log('📊 Counting total clients...')
      const totalClients = await db.crmClient.count({
        where: { storeId },
      })

      console.log('✅ Total clients in store:', totalClients)

      const result = {
        stages: stagesWithClients,
        totalClients,
      }

      console.log('🎯 Final result:', JSON.stringify(result, null, 2))

      return result
    } catch (error) {
      console.error('❌ Error in listGroupedByStage:', error)
      throw error
    }
  },

  async search(term: string, storeId: string, limit = 10) {
    return await db.crmClient.findMany({
      where: {
        storeId,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
          { cpfCnpj: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        stage: true,
      },
    })
  },

  async getStats(storeId: string) {
    const [totalClients, clientsByStage] = await Promise.all([
      db.crmClient.count({
        where: { storeId },
      }),
      db.crmStage.findMany({
        where: { storeId },
        include: {
          _count: {
            select: { clients: true },
          },
        },
        orderBy: { order: 'asc' },
      }),
    ])

    const clientsWithoutStage = await db.crmClient.count({
      where: {
        storeId,
        stageId: null,
      },
    })

    return {
      totalClients,
      clientsByStage: clientsByStage.map((stage) => ({
        stageId: stage.id,
        stageName: stage.name,
        clientsCount: stage._count.clients,
      })),
      clientsWithoutStage: clientsWithoutStage,
    }
  },
}
