import { FlowQueries } from '@/features/(ai)/flow/queries/flow.queries'
import { WorkflowEngine } from './workflow-engine.service'

export const TriggerHandler = {
  async handleMovementCreated(movement: any) {
    try {
      console.log('🔔 Trigger: Movement created', { movementId: movement.id })

      // Buscar flows ativos com trigger de movimentação
      const flows = await FlowQueries.getActiveFlowsByTrigger(movement.storeId, 'movement_created')

      console.log(`Found ${flows.length} flows to execute`)

      // Executar cada flow
      for (const flow of flows) {
        try {
          // Verificar filtros
          if (this.shouldExecuteFlow(flow, { movement })) {
            await this.executeFlow(flow, {
              trigger: { type: 'movement_created' },
              movement,
              store: { id: movement.storeId },
              variables: {},
            })
          }
        } catch (error: any) {
          console.error(`Error executing flow ${flow.id}:`, error)
        }
      }
    } catch (error: any) {
      console.error('Error handling movement created:', error)
      throw error
    }
  },

  async handleStockChange(productId: string, storeId: string, change: any) {
    try {
      console.log('🔔 Trigger: Stock change', { productId, storeId })

      const flows = await FlowQueries.getActiveFlowsByTrigger(storeId, 'stock_change')

      console.log(`Found ${flows.length} flows to execute`)

      for (const flow of flows) {
        try {
          if (this.shouldExecuteFlow(flow, { productId, change })) {
            await this.executeFlow(flow, {
              trigger: { type: 'stock_change' },
              product: change.product,
              store: { id: storeId },
              variables: { change: change.quantity },
            })
          }
        } catch (error: any) {
          console.error(`Error executing flow ${flow.id}:`, error)
        }
      }
    } catch (error: any) {
      console.error('Error handling stock change:', error)
      throw error
    }
  },

  async handleStockBelowMin(product: any) {
    try {
      console.log('🔔 Trigger: Stock below minimum', { productId: product.id })

      const flows = await FlowQueries.getActiveFlowsByTrigger(product.storeId, 'stock_below_min')

      console.log(`Found ${flows.length} flows to execute`)

      for (const flow of flows) {
        try {
          if (this.shouldExecuteFlow(flow, { product })) {
            await this.executeFlow(flow, {
              trigger: { type: 'stock_below_min' },
              product,
              store: { id: product.storeId },
              variables: {},
            })
          }
        } catch (error: any) {
          console.error(`Error executing flow ${flow.id}:`, error)
        }
      }
    } catch (error: any) {
      console.error('Error handling stock below min:', error)
      throw error
    }
  },

  async handleStockAboveMax(product: any) {
    try {
      console.log('🔔 Trigger: Stock above maximum', { productId: product.id })

      const flows = await FlowQueries.getActiveFlowsByTrigger(product.storeId, 'stock_above_max')

      console.log(`Found ${flows.length} flows to execute`)

      for (const flow of flows) {
        try {
          if (this.shouldExecuteFlow(flow, { product })) {
            await this.executeFlow(flow, {
              trigger: { type: 'stock_above_max' },
              product,
              store: { id: product.storeId },
              variables: {},
            })
          }
        } catch (error: any) {
          console.error(`Error executing flow ${flow.id}:`, error)
        }
      }
    } catch (error: any) {
      console.error('Error handling stock above max:', error)
      throw error
    }
  },

  shouldExecuteFlow(flow: any, eventData: any): boolean {
    const nodes = flow.nodes as any[]
    const triggerNode = nodes.find((n) => n.type === 'trigger')

    if (!triggerNode || !triggerNode.data?.config) {
      return false
    }

    const config = triggerNode.data.config
    const filters = config.filters || {}

    // Verificar filtros de produto
    if (filters.productIds && filters.productIds.length > 0) {
      if (eventData.productId && !filters.productIds.includes(eventData.productId)) {
        return false
      }
      if (eventData.product && !filters.productIds.includes(eventData.product.id)) {
        return false
      }
    }

    // Verificar filtros de loja
    if (filters.storeIds && filters.storeIds.length > 0) {
      if (eventData.store && !filters.storeIds.includes(eventData.store.id)) {
        return false
      }
    }

    // Verificar filtros de tipo de movimentação
    if (filters.movementTypes && filters.movementTypes.length > 0) {
      if (eventData.movement && !filters.movementTypes.includes(eventData.movement.type)) {
        return false
      }
    }

    return true
  },

  async executeFlow(flow: any, triggerData: any) {
    try {
      console.log(`Executing flow ${flow.id}: ${flow.name}`)

      const result = await WorkflowEngine.executeWorkflow(flow, triggerData, false)

      console.log(`Flow ${flow.id} executed:`, result)

      return result
    } catch (error: any) {
      console.error(`Error executing flow ${flow.id}:`, error)
      throw error
    }
  },

  async findMatchingFlows(eventType: string, eventData: any) {
    // Buscar flows ativos por tipo de trigger
    // Esta função é uma abstração das funções acima
    const flows = await FlowQueries.getActiveFlowsByTrigger(eventData.storeId, eventType as any)

    // Filtrar flows que atendem aos filtros
    return flows.filter((flow) => this.shouldExecuteFlow(flow, eventData))
  },
}
