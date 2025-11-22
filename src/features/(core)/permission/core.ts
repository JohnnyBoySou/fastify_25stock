export const CORE_PERMISSIONS = [
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
  {
    resource: 'PERMISSIONS',
    action: 'ASSIGN',
    name: 'Atribuir Permissões',
    description: 'Permite atribuir permissões a usuários',
  },
  {
    resource: 'PERMISSIONS',
    action: 'REMOVE',
    name: 'Remover Permissões',
    description: 'Permite remover permissões de usuários',
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
]
