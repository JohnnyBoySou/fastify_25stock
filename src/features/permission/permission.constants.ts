import type { PermissionAction, PermissionResource } from './permission.interfaces'

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
  // USERS
  {
    resource: 'USERS',
    action: 'CREATE',
    name: 'Criar Usuário',
    description: 'Permite criar novos usuários',
  },
  {
    resource: 'USERS',
    action: 'READ',
    name: 'Visualizar Usuários',
    description: 'Permite visualizar usuários',
  },
  {
    resource: 'USERS',
    action: 'UPDATE',
    name: 'Atualizar Usuário',
    description: 'Permite atualizar informações de usuários',
  },
  {
    resource: 'USERS',
    action: 'DELETE',
    name: 'Deletar Usuário',
    description: 'Permite deletar usuários',
  },
  {
    resource: 'USERS',
    action: 'MANAGE',
    name: 'Gerenciar Usuários',
    description: 'Permite gerenciar completamente usuários',
  },

  // PRODUCTS
  {
    resource: 'PRODUCTS',
    action: 'CREATE',
    name: 'Criar Produto',
    description: 'Permite criar novos produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'READ',
    name: 'Visualizar Produtos',
    description: 'Permite visualizar produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'UPDATE',
    name: 'Atualizar Produto',
    description: 'Permite atualizar produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'DELETE',
    name: 'Deletar Produto',
    description: 'Permite deletar produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'MANAGE',
    name: 'Gerenciar Produtos',
    description: 'Permite gerenciar completamente produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'IMPORT',
    name: 'Importar Produtos',
    description: 'Permite importar produtos',
  },
  {
    resource: 'PRODUCTS',
    action: 'EXPORT',
    name: 'Exportar Produtos',
    description: 'Permite exportar produtos',
  },

  // STORES
  {
    resource: 'STORES',
    action: 'CREATE',
    name: 'Criar Loja',
    description: 'Permite criar novas lojas',
  },
  {
    resource: 'STORES',
    action: 'READ',
    name: 'Visualizar Lojas',
    description: 'Permite visualizar lojas',
  },
  {
    resource: 'STORES',
    action: 'UPDATE',
    name: 'Atualizar Loja',
    description: 'Permite atualizar informações da loja',
  },
  {
    resource: 'STORES',
    action: 'DELETE',
    name: 'Deletar Loja',
    description: 'Permite deletar lojas',
  },
  {
    resource: 'STORES',
    action: 'MANAGE',
    name: 'Gerenciar Lojas',
    description: 'Permite gerenciar completamente lojas',
  },

  // ORDERS
  {
    resource: 'ORDERS',
    action: 'CREATE',
    name: 'Criar Pedido',
    description: 'Permite criar novos pedidos',
  },
  {
    resource: 'ORDERS',
    action: 'READ',
    name: 'Visualizar Pedidos',
    description: 'Permite visualizar pedidos',
  },
  {
    resource: 'ORDERS',
    action: 'UPDATE',
    name: 'Atualizar Pedido',
    description: 'Permite atualizar pedidos',
  },
  {
    resource: 'ORDERS',
    action: 'DELETE',
    name: 'Cancelar Pedido',
    description: 'Permite cancelar pedidos',
  },
  {
    resource: 'ORDERS',
    action: 'APPROVE',
    name: 'Aprovar Pedido',
    description: 'Permite aprovar pedidos',
  },
  {
    resource: 'ORDERS',
    action: 'REJECT',
    name: 'Rejeitar Pedido',
    description: 'Permite rejeitar pedidos',
  },

  // INVENTORY
  {
    resource: 'INVENTORY',
    action: 'READ',
    name: 'Visualizar Estoque',
    description: 'Permite visualizar estoque',
  },
  {
    resource: 'INVENTORY',
    action: 'UPDATE',
    name: 'Atualizar Estoque',
    description: 'Permite atualizar estoque',
  },
  {
    resource: 'INVENTORY',
    action: 'MANAGE',
    name: 'Gerenciar Estoque',
    description: 'Permite gerenciar completamente estoque',
  },
  {
    resource: 'INVENTORY',
    action: 'EXPORT',
    name: 'Exportar Estoque',
    description: 'Permite exportar relatórios de estoque',
  },

  // REPORTS
  {
    resource: 'REPORTS',
    action: 'READ',
    name: 'Visualizar Relatórios',
    description: 'Permite visualizar relatórios',
  },
  {
    resource: 'REPORTS',
    action: 'EXPORT',
    name: 'Exportar Relatórios',
    description: 'Permite exportar relatórios',
  },

  // SETTINGS
  {
    resource: 'SETTINGS',
    action: 'READ',
    name: 'Visualizar Configurações',
    description: 'Permite visualizar configurações',
  },
  {
    resource: 'SETTINGS',
    action: 'UPDATE',
    name: 'Atualizar Configurações',
    description: 'Permite atualizar configurações',
  },
  {
    resource: 'SETTINGS',
    action: 'MANAGE',
    name: 'Gerenciar Configurações',
    description: 'Permite gerenciar completamente configurações',
  },

  // PERMISSIONS
  {
    resource: 'PERMISSIONS',
    action: 'READ',
    name: 'Visualizar Permissões',
    description: 'Permite visualizar permissões de usuários',
  },
  {
    resource: 'PERMISSIONS',
    action: 'UPDATE',
    name: 'Gerenciar Permissões',
    description: 'Permite atribuir e remover permissões de usuários',
  },
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
