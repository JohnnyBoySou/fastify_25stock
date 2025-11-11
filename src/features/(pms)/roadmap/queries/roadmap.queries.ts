import { db } from '@/plugins/prisma'
import type { RoadmapStatus } from '../roadmap.interfaces'

export const RoadmapQueries = {
  async getById(id: string) {
    return await db.roadmap.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: RoadmapStatus
  }) {
    const { page = 1, limit = 10, search, status } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (status !== undefined) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      db.roadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { milestones: true },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.roadmap.count({ where }),
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

  async search(term: string, limit = 10) {
    return await db.roadmap.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  },

  async getActive() {
    return await db.roadmap.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { milestones: true },
        },
        milestones: {
          where: {
            status: {
              in: ['IN_PROGRESS', 'PENDING'],
            },
          },
          orderBy: { order: 'asc' },
          take: 5,
        },
      },
    })
  },

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      db.roadmap.count(),
      db.roadmap.count({ where: { status: 'ACTIVE' } }),
      db.roadmap.count({ where: { status: 'COMPLETED' } }),
    ])

    return {
      total,
      active,
      inactive,
    }
  },
}
