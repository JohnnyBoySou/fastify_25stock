import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  DeleteChatSessionRequest,
  GetChatHistoryRequest,
  GetChatSessionRequest,
  SendMessageRequest,
} from './chat.interfaces'
import { ChatCommands } from './commands/chat.commands'
import { ChatQueries } from './queries/chat.query'

export const ChatController = {
  // === ENVIO DE MENSAGENS ===
  async sendMessage(request: SendMessageRequest, reply: FastifyReply) {
    try {
      const { message, context, options } = request.body

      // Usar dados do middleware automaticamente
      const enrichedContext = {
        ...context,
        userId: request.user?.id || context?.userId,
        storeId: request.store?.id || context?.storeId,
      }

      const result = await ChatCommands.processMessage({
        message,
        context: enrichedContext,
        options,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message.includes('LLM')) {
        return reply.status(503).send({
          error: 'Serviço de IA temporariamente indisponível',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === HISTÓRICO DE CHAT ===
  async getHistory(request: GetChatHistoryRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, sessionId } = request.query

      // Usar dados do middleware automaticamente
      const enrichedParams = {
        page,
        limit,
        sessionId,
        userId: request.user?.id,
        storeId: request.store?.id,
      }

      const result = await ChatQueries.list(enrichedParams)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === MENSAGENS DE UMA SESSÃO ESPECÍFICA ===
  async getSessionMessages(
    request: FastifyRequest<{
      Params: { sessionId: string }
      Querystring: {
        page?: number
        limit?: number
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId } = request.params
      const { page = 1, limit = 20 } = request.query

      const result = await ChatQueries.getSessionById(sessionId, { page, limit })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat session not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === ENVIAR MENSAGEM PARA SESSÃO ESPECÍFICA ===
  async sendMessageToSession(
    request: FastifyRequest<{
      Params: { sessionId: string }
      Body: {
        message: string
        options?: {
          temperature?: number
          numPredict?: number
          repeatPenalty?: number
        }
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId } = request.params
      const { message, options } = request.body

      // Usar dados do middleware automaticamente
      const enrichedContext = {
        sessionId,
        userId: request.user?.id,
        storeId: request.store?.id,
      }

      const result = await ChatCommands.processMessage({
        message,
        context: enrichedContext,
        options,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message.includes('LLM')) {
        return reply.status(503).send({
          error: 'Serviço de IA temporariamente indisponível',
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === HISTÓRICO TRADICIONAL (compatibilidade) ===
  async getHistoryTraditional(request: GetChatHistoryRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, sessionId } = request.query

      // Usar dados do middleware automaticamente
      const enrichedParams = {
        page,
        limit,
        sessionId,
        userId: request.user?.id,
        storeId: request.store?.id,
      }

      const result = await ChatQueries.listTraditional(enrichedParams)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === SESSÃO DE CHAT ===
  async getSession(request: GetChatSessionRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.params

      const result = await ChatQueries.getSessionById(sessionId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat session not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async deleteSession(request: DeleteChatSessionRequest, reply: FastifyReply) {
    try {
      const { sessionId } = request.params

      await ChatCommands.deleteSession(sessionId)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat session not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === TOOLBOX ===
  async getToolbox(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await ChatQueries.getToolbox()
      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === EXECUÇÃO DE COMANDOS DA TOOLBOX ===
  async executeCommand(
    request: FastifyRequest<{
      Body: {
        command: string
        params?: any
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { command, params = {} } = request.body

      const result = await ChatCommands.executeToolboxCommand(command, params)

      return reply.send({
        command,
        params,
        result,
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message.includes('Unknown service') || error.message.includes('Unknown')) {
        return reply.status(400).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === ANÁLISE E ESTATÍSTICAS ===
  async getAnalytics(
    request: FastifyRequest<{
      Querystring: {
        startDate?: string
        endDate?: string
        userId?: string
        storeId?: string
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { startDate, endDate, userId, storeId } = request.query

      const result = await ChatQueries.getAnalytics({
        startDate,
        endDate,
        userId,
        storeId,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === BUSCA ===
  async search(
    request: FastifyRequest<{
      Querystring: {
        q: string
        limit?: number
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { q, limit = 10 } = request.query

      const result = await ChatQueries.search(q, limit)

      return reply.send({ messages: result })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === SESSÕES ===
  async getSessions(
    request: FastifyRequest<{
      Querystring: {
        page?: number
        limit?: number
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10 } = request.query

      // Usar dados do middleware automaticamente
      const enrichedParams = {
        page,
        limit,
        userId: request.user?.id,
        storeId: request.store?.id,
      }

      const result = await ChatQueries.getSessions(enrichedParams)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === MENSAGEM ESPECÍFICA ===
  async getMessage(
    request: FastifyRequest<{
      Params: {
        id: string
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params

      const result = await ChatQueries.getById(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat message not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === OPERAÇÕES ADICIONAIS DE SESSÃO ===
  async updateSessionTitle(
    request: FastifyRequest<{
      Params: { sessionId: string }
      Body: { title: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId } = request.params
      const { title } = request.body

      const result = await ChatCommands.updateSessionTitle(sessionId, title)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat session not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === ATUALIZAR TÍTULO INTELIGENTE ===
  async updateSessionTitleIntelligent(
    request: FastifyRequest<{
      Params: { sessionId: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { sessionId } = request.params

      const result = await ChatCommands.updateSessionTitleIntelligent(sessionId)

      return reply.send({
        sessionId,
        title: result,
        message: 'Título atualizado com sucesso',
      })
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Chat session not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  // === OPERAÇÕES DE LIMPEZA ===
  async cleanupOldSessions(
    request: FastifyRequest<{
      Querystring: { daysOld?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { daysOld = 30 } = request.query

      const result = await ChatCommands.cleanupOldSessions(daysOld)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async cleanupOldMessages(
    request: FastifyRequest<{
      Querystring: { daysOld?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { daysOld = 30 } = request.query

      const result = await ChatCommands.cleanupOldMessages(daysOld)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
}
