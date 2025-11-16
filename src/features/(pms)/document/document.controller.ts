import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  CreateDocumentRequest,
  SearchDocumentsRequest,
  ListDocumentsRequest,
  GetDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from './document.interfaces'
import { DocumentCommands } from './commands/document.commands'
import { DocumentQueries } from './queries/document.queries'

export const DocumentController = {
  // === CRUD BÁSICO DE DOCUMENTOS ===
  async create(request: CreateDocumentRequest, reply: FastifyReply) {
    try {
      const {
        folderId,
        title,
        type,
        format,
        content,
        path,
        size,
        mimeType,
        visibility,
        status,
        pinned,
      } = request.body

      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await DocumentCommands.create({
        storeId,
        folderId,
        title,
        type,
        format,
        content,
        path,
        size,
        mimeType,
        visibility,
        status,
        pinned,
        createdById: request.user?.id,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Folder not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async list(request: ListDocumentsRequest, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        format,
        folderId,
        status,
        visibility,
      } = request.query
      const storeId = request.store?.id

      const result = await DocumentQueries.list({
        storeId,
        page: Number(page),
        limit: Number(limit),
        search,
        type,
        format,
        folderId,
        status,
        visibility,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async get(request: GetDocumentRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const storeId = request.store?.id

      const result = await DocumentQueries.getById(id, storeId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Document not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async update(request: UpdateDocumentRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await DocumentCommands.update(id, {
        ...updateData,
        updatedById: request.user?.id,
      })

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Document not found' || error.message === 'Folder not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async delete(request: DeleteDocumentRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await DocumentCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Document not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async search(request: SearchDocumentsRequest, reply: FastifyReply) {
    try {
      const { search, limit } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await DocumentQueries.search(storeId, search, limit)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async getByFolder(
    request: FastifyRequest<{ Params: { folderId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { folderId } = request.params
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await DocumentQueries.getByFolder(storeId, folderId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async getPinned(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await DocumentQueries.getPinned(storeId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await DocumentQueries.getStats(storeId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async togglePinned(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params

      const result = await DocumentCommands.togglePinned(id)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Document not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },
}

