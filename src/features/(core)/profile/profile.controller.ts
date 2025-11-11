import type { FastifyReply, FastifyRequest } from 'fastify'
import { ProfileCommands } from './commands/profile.commands'
import { ProfileQueries } from './queires/profile.queries'

export const ProfileController = {
  async single(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id
      const user = await ProfileQueries.single(userId)
      return reply.status(200).send({ user })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id
      const user = await ProfileCommands.update(userId, request.body)
      return reply.status(200).send({ user, message: 'Profile updated successfully' })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async exclude(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id
      const user = await ProfileCommands.exclude(userId)
      return reply.status(200).send({ user, message: 'Profile excluded successfully' })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async subscription(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id
      const subscription = await ProfileQueries.subscription(userId)
      return reply.status(200).send(subscription)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },
}
