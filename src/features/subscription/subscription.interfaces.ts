import type { FastifyRequest } from 'fastify'

// Interfaces para Plan
export interface CreateSubscriptionRequest extends FastifyRequest {
  body: {
    userId: string
    description?: string
    price: number
    interval: 'MONTHLY' | 'YEARLY'
    features?: any
  }
}

export interface UpdateSubscriptionRequest extends FastifyRequest {
  params: { id: string }
  body: {
    userId?: string
    description?: string
    price?: number
    interval?: 'MONTHLY' | 'YEARLY'
    features?: any
  }
}

export interface GetSubscriptionRequest extends FastifyRequest {
  params: { id: string }
}

export interface ListSubscriptionsRequest extends FastifyRequest {
  query: {
    page?: number
    limit?: number
    search?: string
    interval?: 'MONTHLY' | 'YEARLY'
  }
}

export interface DeleteSubscriptionRequest extends FastifyRequest {
  params: { id: string }
}

export interface UpdateSubscriptionStatusRequest extends FastifyRequest {
  params: { id: string }
  body: {
    active: boolean
  }
}

export interface CompareSubscriptionsRequest extends FastifyRequest {
  query: {
    subscriptionIds: string[]
  }
}

export interface GetSubscriptionCustomersRequest extends FastifyRequest {
  params: { id: string }
  query: {
    page?: number
    limit?: number
    status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIAL'
  }
}

export interface SubscriptionResponse {
  id: string
  userId: string
  description?: string
  price: number
  interval: 'MONTHLY' | 'YEARLY'
  features?: any
  createdAt: Date
  updatedAt: Date
  customersCount?: number
}

export interface PlanComparisonResponse {
  subscriptions: SubscriptionResponse[]
  comparison: {
    priceRange: {
      min: number
      max: number
    }
    intervals: ('MONTHLY' | 'YEARLY')[]
    features: string[]
  }
}

export interface SubscriptionStatsResponse {
  total: number
  active: number
  inactive: number
  monthlySubscriptions: number
  yearlySubscriptions: number
  totalRevenue: number
  averagePrice: number
}

export enum SubscriptionInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
