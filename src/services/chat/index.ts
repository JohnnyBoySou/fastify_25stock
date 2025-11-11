import { ChatRoutes } from '@/features/(ai)/chat/chat.routes'
import type { FastifyInstance } from 'fastify'

export async function ChatService(fastify: FastifyInstance) {
  // Registrar as rotas do chat
  await fastify.register(ChatRoutes, { prefix: '/chat' })
}
