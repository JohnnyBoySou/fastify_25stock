import { FlowExecutionCommands } from '@/features/(ai)/flow-execution/commands/flow-execution.commands'
import type {
  ActionConfig,
  ConditionConfig,
  ExecutionContext,
  FlowNode,
} from '@/features/(ai)/flow/flow.interfaces'
import { ActionExecutor } from './action-executor.service'
import { ConditionEvaluator } from './condition-evaluator.service'
import { LoopController } from './loop-controller.service'

interface ExecutionState {
  executionId: string
  executionPath: string[]
  log: any[]
}

export const WorkflowEngine = {
  async executeWorkflow(
    flow: { nodes: FlowNode[]; edges: any[]; id: string },
    triggerData: any,
    isTest = false
  ) {
    const executionId = `exec-${Date.now()}`
    const state: ExecutionState = {
      executionId,
      executionPath: [],
      log: [],
    }

    // Criar registro de execução
    if (!isTest) {
      await FlowExecutionCommands.create({
        flowId: flow.id,
        status: 'RUNNING',
        triggerType: triggerData.trigger?.type || 'manual',
        triggerData,
        executionLog: [],
      })
    }

    try {
      // Construir contexto de execução
      const context = this.buildExecutionContext(triggerData)

      // Executar workflow
      const result = await this.executeNodes(flow.nodes, flow.edges, context, state)

      // Finalizar execução
      if (!isTest) {
        await FlowExecutionCommands.finalize(executionId, result.success, result.error)
      }

      return {
        success: result.success,
        executionId,
        log: state.log,
      }
    } catch (error: any) {
      if (!isTest) {
        await FlowExecutionCommands.finalize(executionId, false, error.message)
      }
      throw error
    }
  },

  async executeNodes(
    nodes: FlowNode[],
    edges: any[],
    context: ExecutionContext,
    state: ExecutionState
  ) {
    // Encontrar trigger inicial
    const triggerNodes = nodes.filter((n) => n.type === 'trigger')

    if (triggerNodes.length === 0) {
      throw new Error('No trigger node found')
    }

    // Executar a partir do primeiro trigger
    const triggerNode = triggerNodes[0]
    state.executionPath.push(triggerNode.id)
    state.log.push({
      nodeId: triggerNode.id,
      nodeType: 'trigger',
      status: 'success',
      result: { triggered: true },
      timestamp: new Date(),
    })

    // Executar fluxo a partir do trigger
    await this.executeFlowFromNode(triggerNode, nodes, edges, context, state)

    return { success: true }
  },

  async executeFlowFromNode(
    node: FlowNode,
    allNodes: FlowNode[],
    edges: any[],
    context: ExecutionContext,
    state: ExecutionState
  ) {
    // Verificar se já visitamos este node muitas vezes (loop)
    const loopCheck = await LoopController.detectAndHandleLoop(
      node.id,
      state.executionId,
      state.executionPath
    )

    if (!loopCheck.allowed) {
      throw new Error(`Loop detected at node ${node.id} after ${loopCheck.iteration} iterations`)
    }

    state.executionPath.push(node.id)

    try {
      switch (node.type) {
        case 'trigger':
          // Trigger já foi executado
          break

        case 'condition': {
          const conditionResult = await ConditionEvaluator.evaluate(
            node.data.config as ConditionConfig,
            context
          )

          state.log.push({
            nodeId: node.id,
            nodeType: 'condition',
            status: conditionResult ? 'success' : 'skipped',
            result: { evaluated: conditionResult },
            timestamp: new Date(),
          })

          // Se condição falsa, parar execução aqui
          if (!conditionResult) {
            return
          }
          break
        }

        case 'action':
        case 'notification': {
          const actionResult = await ActionExecutor.executeAction(
            node.data.config as ActionConfig,
            context
          )

          state.log.push({
            nodeId: node.id,
            nodeType: node.type,
            status: 'success',
            result: actionResult,
            timestamp: new Date(),
          })
          break
        }
      }

      // Buscar próximos nodes conectados
      const nextEdges = edges.filter((edge) => edge.source === node.id)

      for (const edge of nextEdges) {
        const nextNode = allNodes.find((n) => n.id === edge.target)

        if (nextNode) {
          await this.executeFlowFromNode(nextNode, allNodes, edges, context, state)
        }
      }
    } catch (error: any) {
      state.log.push({
        nodeId: node.id,
        nodeType: node.type,
        status: 'failed',
        error: error.message,
        timestamp: new Date(),
      })
      throw error
    }
  },

  async evaluateCondition(
    conditionConfig: ConditionConfig,
    context: ExecutionContext
  ): Promise<boolean> {
    return ConditionEvaluator.evaluate(conditionConfig, context)
  },

  async executeAction(actionConfig: ActionConfig, context: ExecutionContext) {
    return ActionExecutor.executeAction(actionConfig, context)
  },

  buildExecutionContext(triggerData: any): ExecutionContext {
    return {
      trigger: {
        type: triggerData.trigger?.type || 'manual',
        data: triggerData,
        timestamp: new Date(),
      },
      product: triggerData.product,
      store: triggerData.store,
      movement: triggerData.movement,
      user: triggerData.user,
      variables: triggerData.variables || {},
    }
  },
}
