import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ChatController } from './chat.controller'
import { ChatSchemas } from './chat.schema'

export async function ChatRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)
  // === ENVIO DE MENSAGENS ===
  fastify.post('/messages', {
    schema: ChatSchemas.sendMessage,

    handler: ChatController.sendMessage,
  })

  fastify.post('/sessions/:sessionId/messages', {
    schema: ChatSchemas.sendMessage,

    handler: ChatController.sendMessageToSession,
  })

  // === HISTÓRICO DE CHAT ===
  fastify.get('/messages', {
    schema: ChatSchemas.getHistory,

    handler: ChatController.getHistory,
  })

  // === HISTÓRICO TRADICIONAL (compatibilidade) ===
  fastify.get('/messages/traditional', {
    schema: ChatSchemas.getHistory,

    handler: ChatController.getHistoryTraditional,
  })

  // === MENSAGEM ESPECÍFICA ===
  fastify.get('/messages/:id', {
    handler: ChatController.getMessage,
  })

  // === SESSÕES DE CHAT ===
  fastify.get('/sessions', {
    handler: ChatController.getSessions,
  })

  fastify.get('/sessions/:sessionId', {
    schema: ChatSchemas.getSession,

    handler: ChatController.getSession,
  })

  fastify.get('/sessions/:sessionId/messages', {
    handler: ChatController.getSessionMessages,
  })

  fastify.put('/sessions/:sessionId/title', {
    handler: ChatController.updateSessionTitle,
  })

  fastify.patch('/sessions/:sessionId/title/intelligent', {
    handler: ChatController.updateSessionTitleIntelligent,
  })

  fastify.delete('/sessions/:sessionId', {
    schema: ChatSchemas.deleteSession,

    handler: ChatController.deleteSession,
  })

  // === TOOLBOX ===
  fastify.get('/toolbox', {
    schema: ChatSchemas.getToolbox,

    handler: ChatController.getToolbox,
  })

  // === EXECUÇÃO DE COMANDOS ===
  fastify.post('/execute', {
    handler: ChatController.executeCommand,
  })

  // === ANÁLISE E ESTATÍSTICAS ===
  fastify.get('/analytics', {
    schema: ChatSchemas.getAnalytics,

    handler: ChatController.getAnalytics,
  })

  // === BUSCA ===
  fastify.get('/search', {
    handler: ChatController.search,
  })

  // === OPERAÇÕES DE LIMPEZA ===
  fastify.delete('/cleanup/sessions', {
    handler: ChatController.cleanupOldSessions,
  })

  fastify.delete('/cleanup/messages', {
    handler: ChatController.cleanupOldMessages,
  })
}
