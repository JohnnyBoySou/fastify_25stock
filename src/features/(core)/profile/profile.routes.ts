import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { ProfileController } from './profile.controller'
import { ProfileSchemas } from './profile.schema'

export async function ProfileRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  fastify.get('/', {
    schema: ProfileSchemas.single,
    handler: ProfileController.single,
  })

  fastify.put('/', {
    schema: ProfileSchemas.update,
    handler: ProfileController.update,
  })

  fastify.delete('/', {
    schema: ProfileSchemas.exclude,
    handler: ProfileController.exclude,
  })

  fastify.get('/subscription', {
    handler: ProfileController.subscription,
  })
}
