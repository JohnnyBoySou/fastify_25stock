/**
 * ===========================================
 * 🔐 MIDDLEWARE DE AUTENTICAÇÃO (Refatorado)
 * ===========================================
 *
 * - Verifica e valida tokens JWT.
 * - Anexa o usuário autenticado ao objeto `request.user`.
 * - Retorna erro 401/403 conforme o tipo de falha.
 *
 */

import type { FastifyReply, FastifyRequest } from 'fastify'
import type { JWTPayload } from '@/features/(core)/auth/auth.interfaces'
import { db } from '@/plugins/prisma'
import jwt from 'jsonwebtoken'

export async function Auth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Authorization header missing or invalid' })
    }

    // Extração + verificação do token
    const token = authHeader.slice(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      request.log.error('JWT_SECRET não configurado nas variáveis de ambiente')
      return reply.status(500).send({
        error: 'Internal server error - JWT secret not configured',
      })
    }

    const payload = jwt.verify(token, secret) as JWTPayload

    // Busca o usuário autenticado
    const user = await db.user.findUnique({
      where: { id: payload.userId, status: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return reply.status(403).send({ error: 'User not found or inactive' })
    }

    request.user = user

    return user
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ error: 'Token expired' })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    console.error('Auth middleware error:', error)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}
