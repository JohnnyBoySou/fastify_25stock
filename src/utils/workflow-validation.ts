import type { FlowEdge, FlowNode } from '@/features/(ai)/flow/flow.interfaces'

export const WorkflowValidation = {
  validateFlow(flow: {
    nodes: FlowNode[]
    edges: FlowEdge[]
    name: string
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Verificar se tem nodes
    if (!flow.nodes || flow.nodes.length === 0) {
      errors.push('Flow must have at least one node')
      return { valid: false, errors }
    }

    // Verificar se tem trigger
    if (!this.hasRequiredTrigger(flow.nodes)) {
      errors.push('Flow must have at least one trigger node')
    }

    // Validar nodes
    const nodeErrors = this.validateNodes(flow.nodes)
    errors.push(...nodeErrors)

    // Detectar loops infinitos
    const loopErrors = this.detectInfiniteLoops(flow.nodes, flow.edges || [])
    errors.push(...loopErrors)

    // Validar conexões
    const connectionErrors = this.validateConnections(flow.nodes, flow.edges || [])
    errors.push(...connectionErrors)

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  hasRequiredTrigger(nodes: FlowNode[]): boolean {
    return nodes.some((node) => node.type === 'trigger')
  },

  validateNodes(nodes: FlowNode[]): string[] {
    const errors: string[] = []

    nodes.forEach((node, index) => {
      // Verificar se tem ID único
      const duplicateIds = nodes.filter((n) => n.id === node.id)
      if (duplicateIds.length > 1) {
        errors.push(`Node "${node.id}" has duplicate ID`)
      }

      // Verificar se tem label
      if (!node.data?.label) {
        errors.push(`Node at position ${index} is missing label`)
      }

      // Verificar se node de trigger tem config
      if (node.type === 'trigger' && !node.data?.config) {
        errors.push(`Trigger node "${node.id}" is missing configuration`)
      }

      // Verificar se node de condition tem config
      if (node.type === 'condition' && !node.data?.config) {
        errors.push(`Condition node "${node.id}" is missing configuration`)
      }

      // Verificar se node de action tem config
      if ((node.type === 'action' || node.type === 'notification') && !node.data?.config) {
        errors.push(`${node.type} node "${node.id}" is missing configuration`)
      }
    })

    return errors
  },

  detectInfiniteLoops(nodes: FlowNode[], edges: FlowEdge[], maxDepth = 100): string[] {
    const errors: string[] = []

    // Criar mapa de adjacência
    const adjacency: Record<string, string[]> = {}

    for (const node of nodes) {
      adjacency[node.id] = []
    }

    for (const edge of edges) {
      if (!adjacency[edge.source]) {
        adjacency[edge.source] = []
      }
      adjacency[edge.source].push(edge.target)
    }

    // Verificar loops usando DFS
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string, depth: number): boolean => {
      if (depth > maxDepth) {
        errors.push(
          `Potential infinite loop detected starting from node "${nodeId}" (depth > ${maxDepth})`
        )
        return true
      }

      if (recursionStack.has(nodeId)) {
        errors.push(`Infinite loop detected at node "${nodeId}"`)
        return true
      }

      if (visited.has(nodeId)) {
        return false
      }

      visited.add(nodeId)
      recursionStack.add(nodeId)

      const neighbors = adjacency[nodeId] || []
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor, depth + 1)) {
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    // Verificar todos os nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        hasCycle(node.id, 0)
      }
    }

    return errors
  },

  validateConnections(nodes: FlowNode[], edges: FlowEdge[]): string[] {
    const errors: string[] = []
    const nodeIds = new Set(nodes.map((n) => n.id))

    for (const edge of edges) {
      // Verificar se source existe
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: "${edge.source}"`)
      }

      // Verificar se target existe
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: "${edge.target}"`)
      }

      // Verificar se source e target são diferentes
      if (edge.source === edge.target) {
        errors.push(`Edge cannot connect a node to itself: "${edge.source}"`)
      }
    }

    // Verificar nodes órfãos (sem conexões de entrada exceto trigger)
    for (const node of nodes) {
      if (node.type !== 'trigger') {
        const hasIncomingEdge = edges.some((edge) => edge.target === node.id)
        if (!hasIncomingEdge) {
          errors.push(`Node "${node.id}" (${node.type}) has no incoming connections`)
        }
      }
    }

    return errors
  },

  validateNodeConfig(node: FlowNode): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (node.type === 'trigger') {
      const config = node.data?.config as any
      if (!config?.eventType) {
        errors.push('Trigger node must have eventType')
      }
      if (!config?.filters) {
        errors.push('Trigger node must have filters')
      }
    }

    if (node.type === 'condition') {
      const config = node.data?.config as any
      if (
        !config?.conditions ||
        !Array.isArray(config.conditions) ||
        config.conditions.length === 0
      ) {
        errors.push('Condition node must have at least one condition')
      }
      if (!config?.logicalOperator) {
        errors.push('Condition node must have logicalOperator')
      }
    }

    if (node.type === 'action' || node.type === 'notification') {
      const config = node.data?.config as any
      if (!config?.type) {
        errors.push(`${node.type} node must have action type`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}
