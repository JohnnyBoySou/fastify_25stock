import type { FastifyInstance } from 'fastify'

import { dbPlugin } from './prisma'
import { pushPlugin } from './push'

export async function registerPlugins(fastify: FastifyInstance) {
  await fastify.register(dbPlugin)
  await fastify.register(pushPlugin)
}
