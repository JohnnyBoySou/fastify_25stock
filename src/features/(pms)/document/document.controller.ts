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

import type {
  CreateFolderRequest,
  SearchFoldersRequest,
  ListFoldersRequest,
  GetFolderRequest,
  UpdateFolderRequest,
  DeleteFolderRequest,
} from './folder.interfaces'
import { FolderCommands } from './commands/folder.commands'
import { FolderQueries } from './queries/folder.queries'

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

export const FolderController = {
  // === CRUD BÁSICO DE PASTAS ===
  async create(request: CreateFolderRequest, reply: FastifyReply) {
    try {
      const { name, description, color, icon, parentId } = request.body
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await FolderCommands.create({
        storeId,
        name,
        description,
        color,
        icon,
        parentId,
        createdById: request.user?.id,
      })

      return reply.status(201).send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Folder with this name already exists') {
        return reply.status(400).send({ error: error.message })
      }

      if (error.message === 'Parent folder not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async list(request: ListFoldersRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10, search, parentId } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await FolderQueries.list({
        storeId,
        page: Number(page),
        limit: Number(limit),
        search,
        parentId,
      })

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async get(request: GetFolderRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await FolderQueries.getById(id, storeId)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Folder not found') {
        return reply.status(404).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async update(request: UpdateFolderRequest, reply: FastifyReply) {
    try {
      const { id } = request.params
      const updateData = { ...request.body }

      const result = await FolderCommands.update(id, updateData)

      return reply.send(result)
    } catch (error: any) {
      request.log.error(error)

      if (
        error.message === 'Folder not found' ||
        error.message === 'Parent folder not found' ||
        error.message === 'Folder with this name already exists' ||
        error.message === 'Folder cannot be its own parent' ||
        error.message === 'Cannot move folder: would create circular reference'
      ) {
        return reply.status(400).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async delete(request: DeleteFolderRequest, reply: FastifyReply) {
    try {
      const { id } = request.params

      await FolderCommands.delete(id)

      return reply.status(204).send()
    } catch (error: any) {
      request.log.error(error)

      if (error.message === 'Folder not found') {
        return reply.status(404).send({ error: error.message })
      }

      if (
        error.message === 'Cannot delete folder: it contains documents' ||
        error.message === 'Cannot delete folder: it contains subfolders'
      ) {
        return reply.status(400).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async search(request: SearchFoldersRequest, reply: FastifyReply) {
    try {
      const { search, limit } = request.query
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await FolderQueries.search(storeId, search, limit)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },

  async getTree(request: FastifyRequest, reply: FastifyReply) {
    try {
      const storeId = request.store?.id

      if (!storeId) {
        return reply.status(400).send({ error: 'Store context required' })
      }

      const result = await FolderQueries.getTree(storeId)

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

      const result = await FolderQueries.getStats(storeId)

      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },
}
