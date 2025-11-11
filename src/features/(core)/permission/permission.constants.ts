import type { PermissionAction, PermissionResource } from './permission.interfaces'

import { CRM_PERMISSIONS } from './crm'
import { ERP_PERMISSIONS } from './erp'
import { PMS_PERMISSIONS } from './pms'
import { WFM_PERMISSIONS } from './wfm'
import { CORE_PERMISSIONS } from './core'

// ================================
// LISTA PRÉ-DEFINIDA DE PERMISSÕES
// ================================

export interface PermissionDefinition {
  resource: PermissionResource
  action: PermissionAction
  name: string
  description: string
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  ...CRM_PERMISSIONS,
  ...ERP_PERMISSIONS,
  ...PMS_PERMISSIONS,
  ...WFM_PERMISSIONS,
  ...CORE_PERMISSIONS,
]

// Função auxiliar para buscar permissão por resource e action
export function getPermissionDefinition(
  resource: PermissionResource,
  action: PermissionAction
): PermissionDefinition | undefined {
  return AVAILABLE_PERMISSIONS.find((p) => p.resource === resource && p.action === action)
}

// Função para listar recursos disponíveis
export function getAvailableResources(): PermissionResource[] {
  const resources = new Set<PermissionResource>()
  for (const p of AVAILABLE_PERMISSIONS) {
    resources.add(p.resource)
  }
  return Array.from(resources).sort()
}

// Função para listar ações disponíveis
export function getAvailableActions(): PermissionAction[] {
  const actions = new Set<PermissionAction>()
  for (const p of AVAILABLE_PERMISSIONS) {
    actions.add(p.action)
  }
  return Array.from(actions).sort()
}

// Função para listar permissões por recurso
export function getPermissionsByResource(resource: PermissionResource): PermissionDefinition[] {
  return AVAILABLE_PERMISSIONS.filter((p) => p.resource === resource)
}

// Função para listar permissões por ação
export function getPermissionsByAction(action: PermissionAction): PermissionDefinition[] {
  return AVAILABLE_PERMISSIONS.filter((p) => p.action === action)
}
