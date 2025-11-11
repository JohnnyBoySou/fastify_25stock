import { db } from '@/plugins/prisma'

export const MilestoneQueries = {
  async getById(id: string, roadmapId: string) {
    const milestone = await db.milestone.findFirst({
      where: {
        id,
        roadmapId,
      },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    })

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    return milestone
  },

  async listByRoadmap(
    roadmapId: string,
    params?: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
      page?: number
      limit?: number
    }
  ) {
    const { status, page = 1, limit = 50 } = params || {}
    const skip = (page - 1) * limit

    const where: any = { roadmapId }

    if (status) {
      where.status = status
    }

    const [items, total] = await Promise.all([
      db.milestone.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      db.milestone.count({ where }),
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

  async getByStatus(
    roadmapId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  ) {
    return await db.milestone.findMany({
      where: {
        roadmapId,
        status,
      },
      orderBy: { order: 'asc' },
    })
  },

  async getStats(roadmapId: string) {
    const [total, pending, inProgress, completed, blocked, avgProgress] = await Promise.all([
      db.milestone.count({ where: { roadmapId } }),
      db.milestone.count({ where: { roadmapId, status: 'PENDING' } }),
      db.milestone.count({ where: { roadmapId, status: 'IN_PROGRESS' } }),
      db.milestone.count({ where: { roadmapId, status: 'COMPLETED' } }),
      db.milestone.count({ where: { roadmapId, status: 'BLOCKED' } }),
      db.milestone.aggregate({
        where: { roadmapId },
        _avg: { progress: true },
      }),
    ])

    return {
      total,
      byStatus: {
        pending,
        inProgress,
        completed,
        blocked,
      },
      averageProgress: Math.round(avgProgress._avg.progress || 0),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  },

  async getUpcoming(roadmapId: string, limit = 5) {
    const now = new Date()

    return await db.milestone.findMany({
      where: {
        roadmapId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
        startDate: {
          gte: now,
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    })
  },

  async getOverdue(roadmapId: string) {
    const now = new Date()

    return await db.milestone.findMany({
      where: {
        roadmapId,
        status: {
          notIn: ['COMPLETED'],
        },
        endDate: {
          lt: now,
        },
      },
      orderBy: { endDate: 'asc' },
    })
  },

  async getInProgress(roadmapId: string) {
    return await db.milestone.findMany({
      where: {
        roadmapId,
        status: 'IN_PROGRESS',
      },
      orderBy: { order: 'asc' },
    })
  },

  async search(roadmapId: string, term: string, limit = 10) {
    return await db.milestone.findMany({
      where: {
        roadmapId,
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: { order: 'asc' },
      take: limit,
    })
  },

  // Query para pegar todas as milestones ordenadas (útil para drag & drop)
  async getAllOrdered(roadmapId: string) {
    return await db.milestone.findMany({
      where: { roadmapId },
      orderBy: { order: 'asc' },
    })
  },

  // Query para verificar se há milestones bloqueadas
  async hasBlocked(roadmapId: string) {
    const count = await db.milestone.count({
      where: {
        roadmapId,
        status: 'BLOCKED',
      },
    })

    return count > 0
  },

  // Query para pegar timeline completa
  async getTimeline(roadmapId: string) {
    return await db.milestone.findMany({
      where: {
        roadmapId,
        OR: [{ startDate: { not: null } }, { endDate: { not: null } }],
      },
      orderBy: [{ startDate: 'asc' }, { order: 'asc' }],
    })
  },
}
