import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { FlowExecutionController } from './flow-execution.controller'
import { FlowExecutionSchemas } from './flow-execution.schema'

export async function FlowExecutionRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // Listar execuções
  fastify.get('/flow-executions', {
    schema: FlowExecutionSchemas.list,
    handler: FlowExecutionController.list,
  })

  // Detalhes de uma execução
  fastify.get('/flow-executions/:id', {
    schema: FlowExecutionSchemas.get,
    handler: FlowExecutionController.get,
  })

  // Histórico de um flow específico
  fastify.get('/flow-executions/flow/:flowId', {
    schema: FlowExecutionSchemas.getByFlow,
    handler: FlowExecutionController.getByFlow,
  })

  // Estatísticas de um flow
  fastify.get('/flow-executions/flow/:flowId/stats', {
    schema: FlowExecutionSchemas.getStats,
    handler: FlowExecutionController.getStats,
  })

  // Cancelar execução em andamento
  fastify.post('/flow-executions/:id/cancel', {
    schema: FlowExecutionSchemas.cancel,
    handler: FlowExecutionController.cancel,
  })
}
