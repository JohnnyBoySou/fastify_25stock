import type { FastifyReply, FastifyRequest } from 'fastify'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { PolarCommands } from './commands/polar.commands'
import type { CreateCheckoutRequest, ListPolarRequest } from './polar.interfaces'
import { PolarQueries } from './queries/polar.queries'

export const PolarController = {
  async list(request: ListPolarRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10 } = request.query
      const result = await PolarQueries.list({ page, limit })
      return reply.status(200).send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async checkout(request: CreateCheckoutRequest, reply: FastifyReply) {
    try {
      const { productId } = request.body
      const customer = request.user
      const result = await PolarCommands.checkout({ productId, customer })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Product not found') {
        return reply.status(404).send({
          error: error.message,
        })
      }

      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },

  async webhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Verificar assinatura do webhook (HMAC-SHA256)
      const secret = process.env.POLAR_WEBHOOK_SECRET as string | undefined
      const signatureHeader = (request.headers['polar-signature'] ||
        request.headers['x-polar-signature']) as string | undefined
      const rawBody = (request as any).rawBody as string | undefined

      if (!secret) {
        return reply.status(500).send({ error: 'Webhook secret not configured' })
      }

      if (!signatureHeader || !rawBody) {
        return reply.status(400).send({ error: 'Missing signature or raw body' })
      }

      // Suporta formatos: "sha256=<hex>" ou "t=...,v1=<hex>[,v2=...]"
      const parseSignature = (header: string) => {
        const trimmed = header.trim()
        if (trimmed.startsWith('sha256=')) {
          return { hash: trimmed.slice(7), timestamp: undefined as string | undefined }
        }
        const parts = trimmed.split(',').map((p) => p.trim())
        const kv = new Map(
          parts.map((p) => {
            const idx = p.indexOf('=')
            if (idx === -1) return [p, ''] as [string, string]
            return [p.slice(0, idx), p.slice(idx + 1)] as [string, string]
          })
        )
        return {
          hash: (kv.get('v1') || kv.get('sha256')) as string | undefined,
          timestamp: kv.get('t') as string | undefined,
        }
      }

      const { hash: receivedHash, timestamp } = parseSignature(signatureHeader)
      if (!receivedHash) {
        return reply.status(400).send({ error: 'Invalid signature format' })
      }

      // Opcional: validar janela de tempo se timestamp presente (5 minutos)
      if (timestamp) {
        const tsNum = Number(timestamp)
        const delta = Math.abs(Date.now() / 1000 - tsNum)
        if (!Number.isFinite(tsNum) || delta > 300) {
          return reply.status(400).send({ error: 'Signature timestamp too old' })
        }
      }

      const computed = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
      const valid = (() => {
        try {
          const a = Buffer.from(computed, 'hex')
          const b = Buffer.from(receivedHash, 'hex')
          if (a.length !== b.length) return false
          return timingSafeEqual(a, b)
        } catch {
          return false
        }
      })()

      if (!valid) {
        return reply.status(400).send({ error: 'Invalid signature' })
      }

      const payload = request.body
      const result = await PolarCommands.webhook(payload)

      if (!result || result.success !== true) {
        return reply.status(400).send({
          error: result?.error || 'Webhook processing failed',
        })
      }

      return reply.status(200).send({ success: true })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({
        error: 'Internal server error',
      })
    }
  },
  async getFreePlan(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await PolarQueries.getFreePlan()
      return reply.status(200).send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },
}
