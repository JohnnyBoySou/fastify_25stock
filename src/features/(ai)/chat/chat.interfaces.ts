import type { FastifyRequest } from 'fastify'

// Interfaces para Chat
export interface SendMessageRequest extends FastifyRequest {
  body: {
    message: string
    context?: {
      storeId?: string
      userId?: string
      sessionId?: string
    }
    options?: {
      temperature?: number
      numPredict?: number
      repeatPenalty?: number
    }
  }
}

export interface GetChatHistoryRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    sessionId?: string
    userId?: string
    storeId?: string
  }
}

export interface GetChatSessionRequest extends FastifyRequest {
  params: {
    sessionId: string
  }
}

export interface DeleteChatSessionRequest extends FastifyRequest {
  params: {
    sessionId: string
  }
}

export interface ChatMessageResponse {
  id: string
  message: string
  response: string
  context?: {
    storeId?: string
    userId?: string
    sessionId?: string
  }
  options?: {
    temperature?: number
    numPredict?: number
    repeatPenalty?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface ChatSessionResponse {
  id: string
  userId: string
  storeId?: string
  title?: string
  messages: ChatMessageResponse[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatToolboxResponse {
  availableServices: {
    products: {
      description: string
      methods: string[]
    }
    stores: {
      description: string
      methods: string[]
    }
    categories: {
      description: string
      methods: string[]
    }
    suppliers: {
      description: string
      methods: string[]
    }
    movements: {
      description: string
      methods: string[]
    }
    reports: {
      description: string
      methods: string[]
    }
  }
}

export interface ChatAnalyticsResponse {
  totalMessages: number
  totalSessions: number
  averageMessagesPerSession: number
  mostUsedServices: Array<{
    service: string
    usageCount: number
  }>
  messagesByDay: Array<{
    date: string
    count: number
  }>
}
