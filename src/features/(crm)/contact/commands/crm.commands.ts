import { db } from '@/plugins/prisma'

export const CrmCommands = {
  async create(data: {
    storeId: string
    name: string
    email?: string
    phone?: string
    cpfCnpj?: string
    company?: string
    notes?: string
    stageId?: string
  }) {
    // Validar se stage pertence à mesma store
    if (data.stageId) {
      const stage = await db.crmStage.findFirst({
        where: {
          id: data.stageId,
          storeId: data.storeId,
        },
      })

      if (!stage) {
        throw new Error('Stage not found or does not belong to the same store')
      }
    }

    return await db.crmClient.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        company: data.company,
        notes: data.notes,
        stageId: data.stageId,
      },
      include: {
        stage: true,
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      email?: string
      phone?: string
      cpfCnpj?: string
      company?: string
      notes?: string
      stageId?: string
    },
    storeId: string
  ) {
    // Verificar se cliente pertence à store
    const client = await db.crmClient.findFirst({
      where: {
        id,
        storeId,
      },
    })

    if (!client) {
      throw new Error('Client not found or does not belong to the store')
    }

    // Validar stage se fornecido
    if (data.stageId) {
      const stage = await db.crmStage.findFirst({
        where: {
          id: data.stageId,
          storeId,
        },
      })

      if (!stage) {
        throw new Error('Stage not found or does not belong to the same store')
      }
    }

    return await db.crmClient.update({
      where: { id },
      data,
      include: {
        stage: true,
      },
    })
  },

  async delete(id: string, storeId: string) {
    // Verificar se cliente pertence à store
    const client = await db.crmClient.findFirst({
      where: {
        id,
        storeId,
      },
    })

    if (!client) {
      throw new Error('Client not found or does not belong to the store')
    }

    return await db.crmClient.delete({
      where: { id },
    })
  },

  async transitionStage(clientId: string, stageId: string | null, storeId: string) {
    // Verificar se cliente pertence à store
    const client = await db.crmClient.findFirst({
      where: {
        id: clientId,
        storeId,
      },
    })

    if (!client) {
      throw new Error('Client not found or does not belong to the store')
    }

    // Validar stage se fornecido
    if (stageId) {
      const stage = await db.crmStage.findFirst({
        where: {
          id: stageId,
          storeId,
        },
      })

      if (!stage) {
        throw new Error('Stage not found or does not belong to the same store')
      }
    }

    return await db.crmClient.update({
      where: { id: clientId },
      data: { stageId },
      include: {
        stage: true,
      },
    })
  },
}
