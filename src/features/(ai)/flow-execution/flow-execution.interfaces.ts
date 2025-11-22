import type { FastifyRequest } from 'fastify'
import type {
  FlowExecutionLogEntry,
  FlowExecutionStatus,
} from '@/features/(ai)/flow/flow.interfaces'

// Request Interfaces
export interface GetFlowExecutionRequest extends FastifyRequest {
  Params: { id: string }
}

export interface ListFlowExecutionsRequest extends FastifyRequest {
  Querystring: {
    page?: number
    limit?: number
    flowId?: string
    status?: FlowExecutionStatus
    triggerType?: string
    startDate?: string
    endDate?: string
  }
}

export interface GetByFlowRequest extends FastifyRequest {
  Params: { flowId: string }
  Querystring: {
    page?: number
    limit?: number
    status?: FlowExecutionStatus
  }
}

export interface GetStatsRequest extends FastifyRequest {
  Params: { flowId: string }
}

export interface CancelExecutionRequest extends FastifyRequest {
  Params: { id: string }
}

// Response Interfaces
export interface FlowExecutionResponse {
  id: string
  flowId: string
  status: FlowExecutionStatus
  triggerType: string
  triggerData: any
  executionLog: FlowExecutionLogEntry[]
  error?: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  flow?: {
    id: string
    name: string
  }
}

export interface FlowExecutionListResponse {
  executions: FlowExecutionResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FlowExecutionStatsResponse {
  total: number
  byStatus: {
    success: number
    failed: number
    running: number
    cancelled: number
  }
  byTrigger: Record<string, number>
  averageDuration: number
  lastExecution?: {
    id: string
    status: FlowExecutionStatus
    completedAt: Date
  }
}
