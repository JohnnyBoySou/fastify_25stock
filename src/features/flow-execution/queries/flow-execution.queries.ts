import { db } from '@/plugins/prisma'
import type { FlowExecutionStatus } from '../../flow/flow.interfaces'

export const FlowExecutionQueries = {
  async getById(id: string) {
    try {
      const execution = await db.flowExecution.findUnique({
        where: { id },
        include: {
          flow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!execution) {
        return null
      }

      return execution
    } catch (error: any) {
      console.error('Error getting flow execution by id:', error)
      throw error
    }
  },

  async list(params: {
    page?: number
    limit?: number
    flowId?: string
    status?: FlowExecutionStatus
    triggerType?: string
    startDate?: string
    endDate?: string
  }) {
    try {
      const { page = 1, limit = 10, flowId, status, triggerType, startDate, endDate } = params

      const skip = (page - 1) * limit

      const where: any = {}

      if (flowId) {
        where.flowId = flowId
      }

      if (status) {
        where.status = status
      }

      if (triggerType) {
        where.triggerType = triggerType
      }

      if (startDate || endDate) {
        where.startedAt = {}
        if (startDate) {
          where.startedAt.gte = new Date(startDate)
        }
        if (endDate) {
          where.startedAt.lte = new Date(endDate)
        }
      }

      const [executions, total] = await Promise.all([
        db.flowExecution.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startedAt: 'desc' },
          include: {
            flow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.flowExecution.count({ where }),
      ])

      return {
        executions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      console.error('Error listing flow executions:', error)
      throw error
    }
  },

  async getByFlow(
    flowId: string,
    params: {
      page?: number
      limit?: number
      status?: FlowExecutionStatus
    }
  ) {
    try {
      const { page = 1, limit = 10, status } = params

      const skip = (page - 1) * limit

      const where: any = {
        flowId,
      }

      if (status) {
        where.status = status
      }

      const [executions, total] = await Promise.all([
        db.flowExecution.findMany({
          where,
          skip,
          take: limit,
          orderBy: { startedAt: 'desc' },
          include: {
            flow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.flowExecution.count({ where }),
      ])

      return {
        executions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      console.error('Error getting flow executions by flow:', error)
      throw error
    }
  },

  async getStats(flowId: string) {
    try {
      const [total, byStatus, byTrigger, durations] = await Promise.all([
        db.flowExecution.count({
          where: { flowId },
        }),
        db.flowExecution.groupBy({
          by: ['status'],
          where: { flowId },
          _count: true,
        }),
        db.flowExecution.groupBy({
          by: ['triggerType'],
          where: { flowId },
          _count: true,
        }),
        db.flowExecution.findMany({
          where: {
            flowId,
            durationMs: { not: null },
          },
          select: { durationMs: true },
        }),
      ])

      const statusMap: Record<string, number> = {
        success: 0,
        failed: 0,
        running: 0,
        cancelled: 0,
      }

      for (const item of byStatus) {
        statusMap[item.status.toLowerCase()] = item._count
      }

      const triggerMap: Record<string, number> = {}
      for (const item of byTrigger) {
        triggerMap[item.triggerType] = item._count
      }

      const completedDurations = durations
        .filter((d: any) => d.duration !== null)
        .map((d: any) => d.duration)

      const averageDuration =
        completedDurations.length > 0
          ? completedDurations.reduce((a: number, b: number) => a + b, 0) /
            completedDurations.length
          : 0

      const lastExecution = await db.flowExecution.findFirst({
        where: { flowId },
        orderBy: { startedAt: 'desc' },
        include: {
          flow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return {
        total,
        byStatus: statusMap,
        byTrigger: triggerMap,
        averageDuration,
        lastExecution,
      }
    } catch (error: any) {
      console.error('Error getting flow execution stats:', error)
      throw error
    }
  },
}
