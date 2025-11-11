import { db } from '@/plugins/prisma'

export const SupplierResponsibleCommands = {
  async create({
    supplierId,
    data,
  }: {
    supplierId: string
    data: {
      name: string
      email?: string
      phone?: string
      cpf?: string
    }
  }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    // Verificar se email já existe para este supplier
    if (data.email) {
      const existingEmail = await db.supplierResponsible.findFirst({
        where: {
          supplierId,
          email: data.email,
        },
      })

      if (existingEmail) {
        throw new Error('Email already exists for this supplier')
      }
    }

    // Verificar se CPF já existe para este supplier
    if (data.cpf) {
      const existingCpf = await db.supplierResponsible.findFirst({
        where: {
          supplierId,
          cpf: data.cpf,
        },
      })

      if (existingCpf) {
        throw new Error('CPF already exists for this supplier')
      }
    }

    return await db.supplierResponsible.create({
      data: {
        ...data,
        supplierId,
        status: true,
      },
    })
  },

  async update({
    supplierId,
    responsibleId,
    data,
  }: {
    supplierId: string
    responsibleId: string
    data: {
      name?: string
      email?: string
      phone?: string
      cpf?: string
      status?: boolean
    }
  }) {
    // Verificar se o responsible existe e pertence ao supplier
    const existingResponsible = await db.supplierResponsible.findFirst({
      where: {
        id: responsibleId,
        supplierId,
      },
    })

    if (!existingResponsible) {
      throw new Error('Responsible not found for this supplier')
    }

    // Verificar se email já existe para outro responsible do mesmo supplier
    if (data.email) {
      const existingEmail = await db.supplierResponsible.findFirst({
        where: {
          supplierId,
          email: data.email,
          id: { not: responsibleId },
        },
      })

      if (existingEmail) {
        throw new Error('Email already exists for another responsible of this supplier')
      }
    }

    // Verificar se CPF já existe para outro responsible do mesmo supplier
    if (data.cpf) {
      const existingCpf = await db.supplierResponsible.findFirst({
        where: {
          supplierId,
          cpf: data.cpf,
          id: { not: responsibleId },
        },
      })

      if (existingCpf) {
        throw new Error('CPF already exists for another responsible of this supplier')
      }
    }

    return await db.supplierResponsible.update({
      where: { id: responsibleId },
      data,
    })
  },

  async delete({ supplierId, responsibleId }: { supplierId: string; responsibleId: string }) {
    // Verificar se o responsible existe e pertence ao supplier
    const existingResponsible = await db.supplierResponsible.findFirst({
      where: {
        id: responsibleId,
        supplierId,
      },
    })

    if (!existingResponsible) {
      throw new Error('Responsible not found for this supplier')
    }

    await db.supplierResponsible.delete({
      where: { id: responsibleId },
    })
  },

  async toggleStatus({ supplierId, responsibleId }: { supplierId: string; responsibleId: string }) {
    // Verificar se o responsible existe e pertence ao supplier
    const existingResponsible = await db.supplierResponsible.findFirst({
      where: {
        id: responsibleId,
        supplierId,
      },
    })

    if (!existingResponsible) {
      throw new Error('Responsible not found for this supplier')
    }

    return await db.supplierResponsible.update({
      where: { id: responsibleId },
      data: {
        status: !existingResponsible.status,
      },
    })
  },

  async bulkCreate({
    supplierId,
    responsibles,
  }: {
    supplierId: string
    responsibles: Array<{
      name: string
      email?: string
      phone?: string
      cpf?: string
    }>
  }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    // Verificar duplicatas nos dados fornecidos
    const emails = responsibles.filter((r) => r.email).map((r) => r.email)
    const cpfs = responsibles.filter((r) => r.cpf).map((r) => r.cpf)

    if (new Set(emails).size !== emails.length) {
      throw new Error('Duplicate emails found in the provided data')
    }

    if (new Set(cpfs).size !== cpfs.length) {
      throw new Error('Duplicate CPFs found in the provided data')
    }

    // Verificar se algum email já existe no banco
    if (emails.length > 0) {
      const existingEmails = await db.supplierResponsible.findMany({
        where: {
          supplierId,
          email: { in: emails },
        },
        select: { email: true },
      })

      if (existingEmails.length > 0) {
        throw new Error(`Emails already exist: ${existingEmails.map((e) => e.email).join(', ')}`)
      }
    }

    // Verificar se algum CPF já existe no banco
    if (cpfs.length > 0) {
      const existingCpfs = await db.supplierResponsible.findMany({
        where: {
          supplierId,
          cpf: { in: cpfs },
        },
        select: { cpf: true },
      })

      if (existingCpfs.length > 0) {
        throw new Error(`CPFs already exist: ${existingCpfs.map((c) => c.cpf).join(', ')}`)
      }
    }

    // Criar todos os responsáveis
    return await db.supplierResponsible.createMany({
      data: responsibles.map((responsible) => ({
        ...responsible,
        supplierId,
        status: true,
      })),
    })
  },
}
