import { db } from '@/plugins/prisma'

import { AVANCADED_LIMITATIONS } from './avancado'
import { ESSENTIAL_LIMITATIONS } from './essencial'
import { PROFISSIONAL_LIMITATIONS } from './profissional'

export interface LimitationDefinition {
  resource: string
  limit: number
}

type PlanKey = 'ESSENCIAL' | 'AVANCADO' | 'PROFISSIONAL'

export type LimitationResource = keyof typeof PROFISSIONAL_LIMITATIONS

const PLAN_LIMITATIONS: Record<PlanKey, Record<LimitationResource, number>> = {
  ESSENCIAL: ESSENTIAL_LIMITATIONS as Record<LimitationResource, number>,
  AVANCADO: AVANCADED_LIMITATIONS,
  PROFISSIONAL: PROFISSIONAL_LIMITATIONS,
}

const PLAN_NAME_MAP: Record<string, PlanKey> = {
  ESSENCIAL: 'ESSENCIAL',
  ESSENTIAL: 'ESSENCIAL',
  BASIC: 'ESSENCIAL',
  FREE: 'ESSENCIAL',
  GRATUITO: 'ESSENCIAL',
  AVANCADO: 'AVANCADO',
  ADVANCED: 'AVANCADO',
  INTERMEDIARIO: 'AVANCADO',
  PROFESSIONAL: 'PROFISSIONAL',
  PROFISSIONAL: 'PROFISSIONAL',
  PRO: 'PROFISSIONAL',
  PREMIUM: 'PROFISSIONAL',
}

export const AVAILABLE_LIMITATIONS: LimitationDefinition[] = [
  ...Object.entries(ESSENTIAL_LIMITATIONS).map(([resource, limit]) => ({ resource, limit })),
  ...Object.entries(AVANCADED_LIMITATIONS).map(([resource, limit]) => ({ resource, limit })),
  ...Object.entries(PROFISSIONAL_LIMITATIONS).map(([resource, limit]) => ({ resource, limit })),
] as const

export async function getLimitationByResource(
  resource: string,
  storeId: string,
): Promise<LimitationDefinition | undefined> {
  if (!isLimitationResource(resource)) {
    return undefined
  }

  const store = await db.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          trialEndsAt: true,
          polarCustomerId: true,
          polarSubscriptionId: true,
          polarProductId: true,
          polarPlanName: true,
        },
      },
    },
  })
  if (!store) {
    return undefined
  }

  const planName = store.subscription?.polarPlanName ?? store.plan ?? 'ESSENCIAL'
  const normalizedPlan = normalizePlanName(planName)
  const planLimitations = PLAN_LIMITATIONS[normalizedPlan]

  const limit = planLimitations[resource]

  if (typeof limit !== 'number') {
    return undefined
  }

  return { resource, limit }
}

function isLimitationResource(value: string): value is LimitationResource {
  return Object.prototype.hasOwnProperty.call(PLAN_LIMITATIONS.ESSENCIAL, value)
}

const DIACRITICS_REGEX = /\p{Diacritic}/gu

function normalizePlanName(plan?: string | null): PlanKey {
  if (!plan) {
    return 'ESSENCIAL'
  }

  const normalized = removeDiacritics(plan)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')

  if (PLAN_NAME_MAP[normalized]) {
    return PLAN_NAME_MAP[normalized]
  }

  if (normalized.includes('PROF')) {
    return 'PROFISSIONAL'
  }

  if (normalized.includes('AVAN') || normalized.includes('ADVAN')) {
    return 'AVANCADO'
  }

  return 'ESSENCIAL'
}

function removeDiacritics(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS_REGEX, '')
}
