import type { FastifyReply } from 'fastify'
import { SupportCommands } from './commands/support.commands'
import { SupportQueries } from './queries/support.queries'
import type {
    CreateSupportRequest,
    FindByAllSupportRequest,
    FindByIdSupportRequest,
    FindByQuerySupportRequest,
    RemoveSupportRequest,
    UpdateSupportRequest,
    BulkRemoveSupportRequest
} from './support.interfaces'

export const SupportController = {
    async create(request: CreateSupportRequest, reply: FastifyReply) {
        try {
            const { userId, title, description } = request.body

            const storeId = request.store?.id

            const support = await SupportCommands.create({
                storeId,
                userId,
                title,
                description,
            })

            return reply.status(201).send(support)
        } catch (error: any) {
            request.log.error(error)

            if (error.message === 'User with this email already exists') {
                return reply.status(400).send({
                    error: error.message,
                })
            }

            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async findById(request: FindByIdSupportRequest, reply: FastifyReply) {
        try {
            const { id } = request.params

            const support = await SupportQueries.findById(id)

            return reply.send(support)
        } catch (error: any) {
            request.log.error(error)

            if (error.message === 'Support not found') {
                return reply.status(404).send({
                    error: error.message,
                })
            }

            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async update(request: UpdateSupportRequest, reply: FastifyReply) {
        try {
            const { id } = request.params
            const updateData = { ...request.body }

            const support = await SupportCommands.update(id, updateData)

            return reply.send(support)
        } catch (error: any) {
            request.log.error(error)

            if (error.message === 'Support not found') {
                return reply.status(404).send({
                    error: error.message,
                })
            }


            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async remove(request: RemoveSupportRequest, reply: FastifyReply) {
        try {
            const { id } = request.params

            await SupportCommands.remove(id)

            return reply.status(204).send()
        } catch (error: any) {
            request.log.error(error)

            if (error.message === 'Support not found') {
                return reply.status(404).send({
                    error: error.message,
                })
            }

            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async bulkRemove(request: BulkRemoveSupportRequest, reply: FastifyReply) {
        try {
            const { ids } = request.body

            const result = await SupportCommands.bulkRemove(ids)

            return reply.send(result)
        } catch (error: any) {
            request.log.error(error)
            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async findByAll(request: FindByAllSupportRequest, reply: FastifyReply) {
        try {
            const { page = 1, limit = 10 } = request.query

            const result = await SupportQueries.findByAll(page, limit)

            return reply.send(result)
        } catch (error) {
            request.log.error(error)
            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },

    async findByQuery(
        request: FindByQuerySupportRequest,
        reply: FastifyReply
    ) {
        try {
            const { q, page = 1, limit = 10 } = request.query

            const supports = await SupportQueries.findByQuery(q, page, limit)

            return reply.send(supports)
        } catch (error) {
            request.log.error(error)
            return reply.status(500).send({
                error: 'Internal server error',
            })
        }
    },
}
