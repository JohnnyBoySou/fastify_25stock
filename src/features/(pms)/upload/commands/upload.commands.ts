import type { AttachMediaData, CreateUploadData } from '../upload.interfaces'

import { db } from '@/plugins/prisma'

export const UploadCommands = {
  async create(data: CreateUploadData) {
    const upload = await db.media.create({
      data: {
        url: data.url,
        name: data.name,
        type: data.type,
        size: data.size,
      },
    })

    return upload
  },

  async update(id: string, data: Partial<CreateUploadData>) {
    const upload = await db.media.update({
      where: { id },
      data: {
        ...(data.url && { url: data.url }),
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.size && { size: data.size }),
      },
    })

    return upload
  },

  async delete(id: string) {
    // Primeiro, deletar todas as relações de mídia
    await db.productMedia.deleteMany({
      where: { mediaId: id },
    })

    await db.supplierMedia.deleteMany({
      where: { mediaId: id },
    })

    await db.userMedia.deleteMany({
      where: { mediaId: id },
    })

    await db.storeMedia.deleteMany({
      where: { mediaId: id },
    })

    // Depois deletar a mídia
    await db.media.delete({
      where: { id },
    })
  },

  async attachToProduct(data: AttachMediaData) {
    if (data.entityType !== 'product') {
      throw new Error('Invalid entity type for product attachment')
    }

    const attachment = await db.productMedia.create({
      data: {
        productId: data.entityId,
        mediaId: data.mediaId,
        isPrimary: data.isPrimary || false,
      },
    })

    // Se esta é a imagem principal, remover a flag de principal das outras
    if (data.isPrimary) {
      await db.productMedia.updateMany({
        where: {
          productId: data.entityId,
          id: { not: attachment.id },
        },
        data: { isPrimary: false },
      })
    }

    return attachment
  },

  async attachToSupplier(data: AttachMediaData) {
    if (data.entityType !== 'supplier') {
      throw new Error('Invalid entity type for supplier attachment')
    }

    const attachment = await db.supplierMedia.create({
      data: {
        supplierId: data.entityId,
        mediaId: data.mediaId,
      },
    })

    return attachment
  },

  async attachToUser(data: AttachMediaData) {
    if (data.entityType !== 'user') {
      throw new Error('Invalid entity type for user attachment')
    }

    const attachment = await db.userMedia.create({
      data: {
        userId: data.entityId,
        mediaId: data.mediaId,
      },
    })

    return attachment
  },

  async attachToStore(data: AttachMediaData) {
    if (data.entityType !== 'store') {
      throw new Error('Invalid entity type for store attachment')
    }

    const attachment = await db.storeMedia.create({
      data: {
        storeId: data.entityId,
        mediaId: data.mediaId,
      },
    })

    return attachment
  },

  async detachFromProduct(mediaId: string, entityId: string) {
    const attachment = await db.productMedia.findFirst({
      where: {
        mediaId,
        productId: entityId,
      },
    })

    if (!attachment) {
      throw new Error('Media attachment not found')
    }

    await db.productMedia.delete({
      where: { id: attachment.id },
    })

    return attachment
  },

  async detachFromSupplier(mediaId: string, entityId: string) {
    const attachment = await db.supplierMedia.findFirst({
      where: {
        mediaId,
        supplierId: entityId,
      },
    })

    if (!attachment) {
      throw new Error('Media attachment not found')
    }

    await db.supplierMedia.delete({
      where: { id: attachment.id },
    })

    return attachment
  },

  async detachFromUser(mediaId: string, entityId: string) {
    const attachment = await db.userMedia.findFirst({
      where: {
        mediaId,
        userId: entityId,
      },
    })

    if (!attachment) {
      throw new Error('Media attachment not found')
    }

    await db.userMedia.delete({
      where: { id: attachment.id },
    })

    return attachment
  },

  async detachFromStore(mediaId: string, entityId: string) {
    const attachment = await db.storeMedia.findFirst({
      where: {
        mediaId,
        storeId: entityId,
      },
    })

    if (!attachment) {
      throw new Error('Media attachment not found')
    }

    await db.storeMedia.delete({
      where: { id: attachment.id },
    })

    return attachment
  },

  async setPrimaryForProduct(mediaId: string, productId: string) {
    // Primeiro, remover a flag de principal de todas as outras mídias
    await db.productMedia.updateMany({
      where: {
        productId,
        mediaId: { not: mediaId },
      },
      data: { isPrimary: false },
    })

    // Depois, definir esta como principal
    const attachment = await db.productMedia.updateMany({
      where: {
        mediaId,
        productId,
      },
      data: { isPrimary: true },
    })

    return attachment
  },

  async bulkDelete(mediaIds: string[]) {
    // Deletar todas as relações primeiro
    await Promise.all([
      db.productMedia.deleteMany({
        where: { mediaId: { in: mediaIds } },
      }),
      db.supplierMedia.deleteMany({
        where: { mediaId: { in: mediaIds } },
      }),
      db.userMedia.deleteMany({
        where: { mediaId: { in: mediaIds } },
      }),
      db.storeMedia.deleteMany({
        where: { mediaId: { in: mediaIds } },
      }),
    ])

    // Depois deletar as mídias
    await db.media.deleteMany({
      where: { id: { in: mediaIds } },
    })

    return { deletedCount: mediaIds.length }
  },
}
