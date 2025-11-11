import { db } from '@/plugins/prisma'

export const CrmStageCommands = {
  async create(data: {
    storeId: string
    name: string
    color?: string
    order: number
  }) {
    return await db.crmStage.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        color: data.color,
        order: data.order,
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      color?: string
      order?: number
    },
    storeId: string
  ) {
    // Verificar se stage pertence à store
    const stage = await db.crmStage.findFirst({
      where: {
        id,
        storeId,
      },
    })

    if (!stage) {
      throw new Error('Stage not found or does not belong to the store')
    }

    return await db.crmStage.update({
      where: { id },
      data,
    })
  },

  async delete(id: string, storeId: string) {
    // Verificar se stage pertence à store
    const stage = await db.crmStage.findFirst({
      where: {
        id,
        storeId,
      },
    })

    if (!stage) {
      throw new Error('Stage not found or does not belong to the store')
    }

    // Verificar se há clientes neste stage
    const clientsCount = await db.crmClient.count({
      where: {
        stageId: id,
        storeId,
      },
    })

    if (clientsCount > 0) {
      throw new Error('Cannot delete stage with clients. Move clients to another stage first.')
    }

    return await db.crmStage.delete({
      where: { id },
    })
  },

  async reorder(id: string, newOrder: number, storeId: string) {
    // Verificar se stage pertence à store
    const stage = await db.crmStage.findFirst({
      where: {
        id,
        storeId,
      },
    })

    if (!stage) {
      throw new Error('Stage not found or does not belong to the store')
    }

    // Atualizar ordem do stage
    return await db.crmStage.update({
      where: { id },
      data: { order: newOrder },
    })
  },
}
