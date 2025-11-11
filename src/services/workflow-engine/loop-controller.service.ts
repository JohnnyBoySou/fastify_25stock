import { FlowExecutionCommands } from '@/features/(ai)/flow-execution/commands/flow-execution.commands'

const MAX_LOOP_ITERATIONS = 100

interface LoopState {
  nodeId: string
  iterationCount: number
  lastVisit: Date
}

interface LoopStatesMap {
  [executionId: string]: {
    [nodeId: string]: LoopState
  }
}

const loopStates: LoopStatesMap = {}

export const LoopController = {
  checkLoop(nodeId: string, executionPath: string[]): boolean {
    // Contar quantas vezes este node já foi visitado no path
    const visitCount = executionPath.filter((id) => id === nodeId).length

    return visitCount >= MAX_LOOP_ITERATIONS
  },

  async incrementLoopCounter(nodeId: string, executionId: string): Promise<number> {
    // Obter ou criar estado de loop para esta execução
    if (!loopStates[executionId]) {
      loopStates[executionId] = {}
    }

    const loopState = loopStates[executionId]

    if (!loopState[nodeId]) {
      loopState[nodeId] = {
        nodeId,
        iterationCount: 0,
        lastVisit: new Date(),
      }
    }

    const state = loopState[nodeId]
    state.iterationCount++
    state.lastVisit = new Date()

    return state.iterationCount
  },

  getIterationCount(nodeId: string, executionId: string): number {
    if (!loopStates[executionId]) {
      return 0
    }

    const loopState = loopStates[executionId]
    if (!loopState[nodeId]) {
      return 0
    }

    return loopState[nodeId].iterationCount
  },

  isLoopLimitReached(nodeId: string, executionId: string): boolean {
    const count = this.getIterationCount(nodeId, executionId)
    return count >= MAX_LOOP_ITERATIONS
  },

  resetLoopCounters(executionId: string) {
    delete loopStates[executionId]
  },

  async detectAndHandleLoop(
    nodeId: string,
    executionId: string,
    executionPath: string[]
  ): Promise<{ allowed: boolean; iteration: number }> {
    const hasLoop = this.checkLoop(nodeId, executionId, executionPath)

    if (hasLoop) {
      const iteration = await this.incrementLoopCounter(nodeId, executionId)
      const limitReached = this.isLoopLimitReached(nodeId, executionId)

      if (limitReached) {
        // Log de erro na execução
        await FlowExecutionCommands.update(executionId, {
          status: 'FAILED',
          error: `Loop limit exceeded at node "${nodeId}" after ${iteration} iterations`,
        })

        return { allowed: false, iteration }
      }

      return { allowed: true, iteration }
    }

    // Primeira visita ao node
    const iteration = await this.incrementLoopCounter(nodeId, executionId)
    return { allowed: true, iteration }
  },
}
