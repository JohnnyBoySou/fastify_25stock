import { db } from '@/plugins/prisma'
import { ChatToolbox } from '../queries/chat.query'

export const ChatCommands = {
  // === CRIAÇÃO DE SESSÃO ===
  async createSession(data: {
    userId: string
    storeId?: string
    title?: string
  }) {
    const session = await db.chatSession.create({
      data: {
        userId: data.userId,
        storeId: data.storeId,
        title: data.title || '💬 Nova conversa',
      },
    })

    return session
  },

  // === CRIAÇÃO DE MENSAGEM ===
  async createMessage(data: {
    content: string
    isFromUser: boolean
    sessionId: string
    context?: any
    options?: any
  }) {
    const chatMessage = await db.chatMessage.create({
      data: {
        content: data.content,
        role: data.isFromUser ? 'USER' : 'ASSISTANT',
        sessionId: data.sessionId,
        context: data.context || {},
        options: data.options || {},
      },
      include: {
        session: {
          select: {
            id: true,
            userId: true,
            storeId: true,
            title: true,
          },
        },
      },
    })

    return chatMessage
  },

  // === PROCESSAMENTO COMPLETO DE MENSAGEM ===
  async processMessage(data: {
    message: string
    context?: {
      storeId?: string
      userId?: string
      sessionId?: string
    }
    options?: {
      temperature?: number
      numPredict?: number
      repeatPenalty?: number
    }
  }) {
    // Criar ou buscar sessão de chat
    let sessionId = data.context?.sessionId
    if (!sessionId) {
      const session = await ChatCommands.createSession({
        userId: data.context?.userId || 'anonymous',
        storeId: data.context?.storeId,
        title: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
      })
      sessionId = session.id
    }

    const chatMessage = await ChatCommands.createMessage({
      content: data.message,
      isFromUser: true,
      sessionId,
      context: data.context || {},
      options: data.options || {},
    })

    await ChatCommands.updateSessionTimestamp(sessionId)

    await ChatCommands.updateSessionTitleIntelligent(sessionId)

    return chatMessage
  },

  // === GERAR TÍTULO INTELIGENTE ===
  async generateSmartTitle(messages: Array<{ message: string; response: string }>) {
    if (messages.length === 0) return 'Nova conversa'

    // Pegar as últimas 3 mensagens para contexto
    const recentMessages = messages.slice(-3)
    const allText = recentMessages
      .map((m) => `${m.message} ${m.response}`)
      .join(' ')
      .toLowerCase()

    // Detectar contexto principal
    if (
      allText.includes('produto') ||
      allText.includes('estoque') ||
      allText.includes('inventário')
    ) {
      if (allText.includes('baixo') || allText.includes('crítico')) {
        return '📦 Análise de Estoque Crítico'
      }
      if (allText.includes('relatório') || allText.includes('relatorio')) {
        return '📊 Relatório de Produtos'
      }
      if (allText.includes('categoria') || allText.includes('categorias')) {
        return '📂 Produtos por Categoria'
      }
      return '📦 Consulta de Produtos'
    }

    if (allText.includes('categoria') || allText.includes('categorias')) {
      if (allText.includes('hierarquia') || allText.includes('estrutura')) {
        return '🌳 Hierarquia de Categorias'
      }
      if (allText.includes('criar') || allText.includes('nova')) {
        return '➕ Gestão de Categorias'
      }
      return '📂 Consulta de Categorias'
    }

    if (allText.includes('loja') || allText.includes('lojas') || allText.includes('store')) {
      if (allText.includes('relatório') || allText.includes('relatorio')) {
        return '🏪 Relatório de Lojas'
      }
      return '🏪 Consulta de Lojas'
    }

    if (
      allText.includes('fornecedor') ||
      allText.includes('fornecedores') ||
      allText.includes('supplier')
    ) {
      if (allText.includes('relatório') || allText.includes('relatorio')) {
        return '🚚 Relatório de Fornecedores'
      }
      return '🚚 Consulta de Fornecedores'
    }

    if (
      allText.includes('movimentação') ||
      allText.includes('movimentações') ||
      allText.includes('movimento')
    ) {
      if (allText.includes('entrada') || allText.includes('saída')) {
        return '📈 Movimentações de Estoque'
      }
      return '📈 Consulta de Movimentações'
    }

    if (
      allText.includes('relatório') ||
      allText.includes('relatorio') ||
      allText.includes('relatórios')
    ) {
      return '📊 Geração de Relatórios'
    }

    if (allText.includes('usuário') || allText.includes('usuarios') || allText.includes('user')) {
      return '👥 Gestão de Usuários'
    }

    if (
      allText.includes('configuração') ||
      allText.includes('configuracao') ||
      allText.includes('config')
    ) {
      return '⚙️ Configurações do Sistema'
    }

    if (allText.includes('ajuda') || allText.includes('help') || allText.includes('como')) {
      return '❓ Suporte e Ajuda'
    }

    // Título baseado na primeira mensagem se não conseguir detectar contexto
    const firstMessage = messages[0]?.message || ''
    if (firstMessage.length > 0) {
      const truncated = firstMessage.substring(0, 30)
      return truncated.length < firstMessage.length ? `${truncated}...` : truncated
    }

    return '💬 Conversa Geral'
  },

  // === ATUALIZAR TIMESTAMP DA SESSÃO ===
  async updateSessionTimestamp(sessionId: string) {
    await db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })
  },

  // === ATUALIZAR TÍTULO DA SESSÃO ===
  async updateSessionTitle(sessionId: string, title: string) {
    const session = await db.chatSession.update({
      where: { id: sessionId },
      data: { title },
    })

    return session
  },

  // === ATUALIZAR TÍTULO INTELIGENTE ===
  async updateSessionTitleIntelligent(sessionId: string) {
    // Buscar todas as mensagens da sessão
    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      select: { content: true, role: true },
      orderBy: { createdAt: 'asc' },
    })

    // Transformar mensagens para o formato esperado
    const formattedMessages: Array<{ message: string; response: string }> = []
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'USER') {
        const nextMessage = messages[i + 1]
        const response = nextMessage?.role === 'ASSISTANT' ? nextMessage.content : ''
        formattedMessages.push({
          message: messages[i].content,
          response,
        })
      }
    }

    // Gerar título inteligente
    const smartTitle = await ChatCommands.generateSmartTitle(formattedMessages)

    // Atualizar título da sessão
    await db.chatSession.update({
      where: { id: sessionId },
      data: { title: smartTitle },
    })

    return smartTitle
  },

  // === EXECUÇÃO DE COMANDO DA TOOLBOX ===
  async executeToolboxCommand(command: string, params: any = {}) {
    return await ChatToolbox.executeCommand(command, params)
  },

  // === EXECUÇÃO DE COMANDO COM CONTEXTO ===
  async executeCommandWithContext(data: {
    command: string
    params?: any
    context?: {
      storeId?: string
      userId?: string
    }
  }) {
    // Aplicar contexto aos parâmetros se necessário
    const enrichedParams = {
      ...data.params,
      ...(data.context?.storeId && { storeId: data.context.storeId }),
      ...(data.context?.userId && { userId: data.context.userId }),
    }

    return await ChatToolbox.executeCommand(data.command, enrichedParams)
  },

  // === DELETAR SESSÃO ===
  async deleteSession(sessionId: string) {
    // Verificar se a sessão existe
    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Chat session not found')
    }

    // Deletar mensagens da sessão
    await db.chatMessage.deleteMany({
      where: { sessionId },
    })

    // Deletar a sessão
    await db.chatSession.delete({
      where: { id: sessionId },
    })

    return { success: true }
  },

  // === DELETAR MENSAGEM ===
  async deleteMessage(messageId: string) {
    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      throw new Error('Chat message not found')
    }

    await db.chatMessage.delete({
      where: { id: messageId },
    })

    return { success: true }
  },

  // === LIMPEZA DE SESSÕES ANTIGAS ===
  async cleanupOldSessions(daysOld = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const deletedSessions = await db.chatSession.deleteMany({
      where: {
        updatedAt: {
          lt: cutoffDate,
        },
      },
    })

    return {
      deletedSessions: deletedSessions.count,
      cutoffDate,
    }
  },

  // === LIMPEZA DE MENSAGENS ANTIGAS ===
  async cleanupOldMessages(daysOld = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const deletedMessages = await db.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    return {
      deletedMessages: deletedMessages.count,
      cutoffDate,
    }
  },

  // === BATCH OPERATIONS ===
  async createMultipleMessages(
    messages: Array<{
      content: string
      isFromUser: boolean
      sessionId: string
      context?: any
      options?: any
    }>
  ) {
    const createdMessages = await db.chatMessage.createMany({
      data: messages.map((msg) => ({
        content: msg.content,
        isFromUser: msg.isFromUser,
        sessionId: msg.sessionId,
        context: msg.context || {},
        options: msg.options || {},
      })),
    })

    return createdMessages
  },

  // === MIGRAÇÃO DE DADOS ===
  async migrateSessionData(oldSessionId: string, newSessionId: string) {
    // Mover mensagens de uma sessão para outra
    const updatedMessages = await db.chatMessage.updateMany({
      where: { sessionId: oldSessionId },
      data: { sessionId: newSessionId },
    })

    // Deletar sessão antiga se estiver vazia
    const oldSession = await db.chatSession.findUnique({
      where: { id: oldSessionId },
      include: { messages: true },
    })

    if (oldSession && oldSession.messages.length === 0) {
      await db.chatSession.delete({
        where: { id: oldSessionId },
      })
    }

    return {
      migratedMessages: updatedMessages.count,
      oldSessionDeleted: oldSession?.messages.length === 0,
    }
  },
}
