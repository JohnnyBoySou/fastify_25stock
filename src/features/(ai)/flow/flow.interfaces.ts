import type { FastifyRequest } from 'fastify'

// Enums
export type FlowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'
export type FlowNodeType = 'TRIGGER' | 'CONDITION' | 'ACTION' | 'NOTIFICATION'
export type FlowExecutionStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'CANCELLED'

export type TriggerEventType =
  | 'stock_change'
  | 'movement_created'
  | 'stock_below_min'
  | 'stock_above_max'
export type ComparisonOperator = '<' | '>' | '==' | '<=' | '>=' | '!='
export type LogicalOperator = 'AND' | 'OR'
export type ActionType = 'email' | 'webhook' | 'internal_notification' | 'sms' | 'push_notification'

// Base Interfaces
export interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    color?: string
    config?: TriggerConfig | ConditionConfig | ActionConfig
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  style?: Record<string, unknown>
  markerEnd?: string | object
  label?: string
}

// Configurations
export interface TriggerConfig {
  eventType: TriggerEventType
  filters: {
    productIds?: string[]
    storeIds?: string[]
    movementTypes?: ('ENTRADA' | 'SAIDA' | 'PERDA')[]
  }
}

export interface ConditionConfig {
  conditions: Array<{
    field: 'stock_quantity' | 'movement_value' | 'movement_type' | 'stock_percentage'
    operator: ComparisonOperator
    value: any
  }>
  logicalOperator: LogicalOperator
}

export interface ActionConfig {
  type: ActionType
  config: {
    // Email
    to?: string | string[]
    subject?: string

    // Webhook
    url?: string
    method?: 'GET' | 'POST' | 'PUT'
    headers?: Record<string, string>
    body?: string | Record<string, unknown>

    // Internal Notification
    userIds?: string[]
    title?: string
    message?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

    // SMS
    // message já definido acima

    // Push Notification
    icon?: string
    badge?: string
    data?: Record<string, unknown>
    actions?: Array<{
      action: string
      title: string
      icon?: string
    }>
  }
}

// Flow Entity
export interface FlowEntity {
  id: string
  name: string
  description?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  status: FlowStatus
  storeId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  store?: {
    id: string
    name: string
  }
}

// Execution Context
export interface ExecutionContext {
  trigger: {
    type: string
    data: any
    timestamp: Date
  }
  product?: {
    id: string
    name: string
    stock?: number
    [key: string]: any
  }
  store?: {
    id: string
    name: string
    [key: string]: any
  }
  movement?: {
    id: string
    type: 'ENTRADA' | 'SAIDA' | 'PERDA'
    quantity: number
    [key: string]: any
  }
  user?: {
    id: string
    name: string
    email: string
    [key: string]: any
  }
  variables: Record<string, any>
}

// FlowExecution Log Entry
export interface FlowExecutionLogEntry {
  nodeId: string
  nodeType: string
  status: 'success' | 'failed' | 'skipped'
  result?: any
  error?: string
  timestamp: Date
  duration?: number
}

// Request Interfaces
export interface CreateFlowRequest extends FastifyRequest {
  Body: {
    name: string
    description?: string
    nodes: FlowNode[]
    edges: FlowEdge[]
    status?: FlowStatus
  }
}

export interface UpdateFlowRequest extends FastifyRequest {
  Params: { id: string }
  Body: {
    name?: string
    description?: string
    nodes?: FlowNode[]
    edges?: FlowEdge[]
    status?: FlowStatus
  }
}

export interface GetFlowRequest extends FastifyRequest {
  Params: { id: string }
}

export interface DeleteFlowRequest extends FastifyRequest {
  Params: { id: string }
}

export interface ListFlowsRequest extends FastifyRequest {
  Querystring: {
    page?: number
    limit?: number
    search?: string
    status?: FlowStatus
  }
}

export interface UpdateFlowStatusRequest extends FastifyRequest {
  Params: { id: string }
  Body: {
    status: FlowStatus
  }
}

export interface DuplicateFlowRequest extends FastifyRequest {
  Params: { id: string }
  Body?: {
    name?: string
  }
}

export interface TestFlowRequest extends FastifyRequest {
  Params: { id: string }
  Body: {
    triggerData: any
  }
}

// Response Interfaces
export interface FlowResponse {
  id: string
  name: string
  description?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  status: FlowStatus
  storeId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface FlowListResponse {
  flows: FlowResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

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
}
