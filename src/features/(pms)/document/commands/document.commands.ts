import { db } from '@/plugins/prisma'

export const DocumentCommands = {
  async create(data: {
    storeId: string
    folderId?: string
    title: string
    type: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
    format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
    content?: any
    path?: string
    size?: number
    mimeType?: string
    visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
    status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
    pinned?: boolean
    createdById?: string
  }) {
    // Se folderId foi fornecido, verificar se existe
    if (data.folderId) {
      const folder = await db.documentFolder.findUnique({
        where: { id: data.folderId, storeId: data.storeId },
      })

      if (!folder) {
        throw new Error('Folder not found')
      }
    }

    // Se type é TEXT e content é fornecido, converter para JSON se for string
    let contentData = data.content
    if (data.type === 'TEXT' && data.content && typeof data.content === 'string') {
      try {
        contentData = JSON.parse(data.content)
      } catch {
        // Se não for JSON válido, mantém como string
        contentData = data.content
      }
    }

    return await db.document.create({
      data: {
        storeId: data.storeId,
        folderId: data.folderId,
        title: data.title,
        type: data.type,
        format: data.format,
        content: contentData,
        path: data.path,
        size: data.size,
        mimeType: data.mimeType,
        visibility: data.visibility || 'PRIVATE',
        status: data.status || 'ACTIVE',
        pinned: data.pinned || false,
        createdById: data.createdById,
      },
      include: {
        folder: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      folderId?: string
      title?: string
      type?: 'TEXT' | 'DOCX' | 'PDF' | 'TEMPLATE' | 'OTHER'
      format?: 'MARKDOWN' | 'HTML' | 'JSON' | 'DOCX' | 'PDF'
      content?: any
      path?: string
      size?: number
      mimeType?: string
      visibility?: 'PRIVATE' | 'PUBLIC' | 'INTERNAL'
      status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
      pinned?: boolean
      updatedById?: string
    }
  ) {
    // Verificar se o documento existe
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // Se folderId foi fornecido, verificar se existe
    if (data.folderId) {
      const folder = await db.documentFolder.findUnique({
        where: { id: data.folderId },
      })

      if (!folder) {
        throw new Error('Folder not found')
      }
    }

    // Se content foi fornecido e type é TEXT, converter para JSON se necessário
    let contentData = data.content
    if (data.content !== undefined && (data.type === 'TEXT' || document.type === 'TEXT')) {
      if (typeof data.content === 'string') {
        try {
          contentData = JSON.parse(data.content)
        } catch {
          // Se não for JSON válido, mantém como string
          contentData = data.content
        }
      }
    }

    // Incrementar versão se content mudou
    const updateData: any = {
      ...data,
      content: contentData,
      updatedById: data.updatedById,
    }

    if (data.content !== undefined) {
      updateData.version = { increment: 1 }
    }

    return await db.document.update({
      where: { id },
      data: updateData,
      include: {
        folder: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    // Verificar se o documento existe
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // Soft delete: apenas marcar como deletado
    return await db.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    })
  },

  async hardDelete(id: string) {
    // Verificar se o documento existe
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // Hard delete: remover permanentemente
    return await db.document.delete({
      where: { id },
    })
  },

  async togglePinned(id: string) {
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    return await db.document.update({
      where: { id },
      data: {
        pinned: !document.pinned,
      },
    })
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'ARCHIVED' | 'DELETED') {
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      throw new Error('Document not found')
    }

    const updateData: any = { status }

    if (status === 'DELETED') {
      updateData.deletedAt = new Date()
    }

    return await db.document.update({
      where: { id },
      data: updateData,
    })
  },
}
