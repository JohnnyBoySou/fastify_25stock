import { db } from '@/plugins/prisma'
import type { FlowStatus, TriggerEventType } from '../flow.interfaces'

export const FlowQueries = {
  async getById(id: string) {
    try {
      const flow = await db.flow.findUnique({
        where: { id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!flow) {
        return null
      }

      return flow
    } catch (error: any) {
      console.error('Error getting flow by id:', error)
      throw error
    }
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: FlowStatus
    storeId?: string
  }) {
    try {
      const { page = 1, limit = 10, search, status, storeId } = params

      const skip = (page - 1) * limit

      const where: any = {}

      if (status) {
        where.status = status
      }

      if (storeId) {
        where.storeId = storeId
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [flows, total] = await Promise.all([
        db.flow.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        db.flow.count({ where }),
      ])

      return {
        items: flows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      console.error('Error listing flows:', error)
      throw error
    }
  },

  async getByStore(storeId: string) {
    try {
      const flows = await db.flow.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return flows
    } catch (error: any) {
      console.error('Error getting flows by store:', error)
      throw error
    }
  },

  async getActiveFlowsByTrigger(storeId: string, triggerType: TriggerEventType) {
    try {
      const flows = await db.flow.findMany({
        where: {
          storeId,
          status: 'ACTIVE',
        },
      })

      // Filtrar flows que têm um trigger node com o eventType específico
      const matchingFlows = flows.filter((flow) => {
        const nodes = flow.nodes as any[]
        return nodes.some((node) => {
          if (node.type === 'trigger' && node.data?.config) {
            const config = node.data.config as any
            return config.eventType === triggerType
          }
          return false
        })
      })

      return matchingFlows
    } catch (error: any) {
      console.error('Error getting active flows by trigger:', error)
      throw error
    }
  },

  async getActiveFlowsByStore(storeId: string) {
    try {
      const flows = await db.flow.findMany({
        where: {
          storeId,
          status: 'ACTIVE',
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return flows
    } catch (error: any) {
      console.error('Error getting active flows by store:', error)
      throw error
    }
  },

  async search(params: {
    searchTerm: string
    storeId?: string
    limit?: number
    page?: number
  }) {
    const { searchTerm, storeId, limit = 10, page = 1 } = params
    try {
      const where: any = {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }

      if (storeId) {
        where.storeId = storeId
      }

      const flows = await db.flow.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      const total = await db.flow.count({ where })

      return {
        items: flows,
        pagination: {
          page,
          limit,
          total: flows.length,
          totalPages: Math.ceil(total / Number(limit)),
        },
      }
    } catch (error: any) {
      console.error('Error searching flows:', error)
      throw error
    }
  },

  async getStats(storeId?: string) {
    try {
      const where: any = {}
      if (storeId) {
        where.storeId = storeId
      }

      const [total, active, inactive, draft] = await Promise.all([
        db.flow.count({ where }),
        db.flow.count({ where: { ...where, status: 'ACTIVE' } }),
        db.flow.count({ where: { ...where, status: 'INACTIVE' } }),
        db.flow.count({ where: { ...where, status: 'DRAFT' } }),
      ])

      return {
        total,
        active,
        inactive,
        draft,
      }
    } catch (error: any) {
      console.error('Error getting flow stats:', error)
      throw error
    }
  },
}
