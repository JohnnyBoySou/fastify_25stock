import { db } from '@/plugins/prisma'
import type { FlowExecutionStatus } from '@/features/(ai)/flow/flow.interfaces'

export const FlowExecutionCommands = {
  async create(data: {
    flowId: string
    status: FlowExecutionStatus
    triggerType: string
    triggerData: any
    executionLog: any[]
  }) {
    try {
      const execution = await db.flowExecution.create({
        data: {
          flowId: data.flowId,
          status: data.status,
          triggerType: data.triggerType,
          triggerData: data.triggerData as any,
          executionLog: data.executionLog as any,
        },
      })

      return execution
    } catch (error: any) {
      console.error('Error creating flow execution:', error)
      throw error
    }
  },

  async update(
    executionId: string,
    data: {
      status?: FlowExecutionStatus
      executionLog?: any[]
      error?: string
      completedAt?: Date
      duration?: number
    }
  ) {
    try {
      const execution = await db.flowExecution.update({
        where: { id: executionId },
        data: {
          ...data,
          executionLog: data.executionLog as any,
        },
      })

      return execution
    } catch (error: any) {
      console.error('Error updating flow execution:', error)
      throw error
    }
  },

  async cancel(executionId: string) {
    try {
      const execution = await db.flowExecution.update({
        where: { id: executionId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
        },
      })

      return execution
    } catch (error: any) {
      console.error('Error cancelling flow execution:', error)
      throw error
    }
  },

  async finalize(executionId: string, success: boolean, error?: string) {
    try {
      const startTime = await db.flowExecution.findUnique({
        where: { id: executionId },
        select: { startedAt: true },
      })

      const durationMs = startTime ? Date.now() - startTime.startedAt.getTime() : undefined

      const execution = await db.flowExecution.update({
        where: { id: executionId },
        data: {
          status: success ? 'SUCCESS' : 'FAILED',
          error,
          completedAt: new Date(),
          durationMs,
        },
      })

      return execution
    } catch (error: any) {
      console.error('Error finalizing flow execution:', error)
      throw error
    }
  },
}
