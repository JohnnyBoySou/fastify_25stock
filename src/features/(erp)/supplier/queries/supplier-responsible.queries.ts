import { db } from '@/plugins/prisma'

export const SupplierResponsibleQueries = {
  async getById({ supplierId, responsibleId }: { supplierId: string; responsibleId: string }) {
    const responsible = await db.supplierResponsible.findFirst({
      where: {
        id: responsibleId,
        supplierId,
      },
    })

    if (!responsible) {
      throw new Error('Responsible not found for this supplier')
    }

    return responsible
  },

  async list({
    supplierId,
    params,
  }: {
    supplierId: string
    params: {
      page?: number
      limit?: number
      search?: string
      status?: boolean
    }
  }) {
    const { page = 1, limit = 10, search, status } = params
    const skip = (page - 1) * limit

    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    // Construir filtros
    const where: any = {
      supplierId,
    }

    if (status !== undefined) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Buscar responsáveis
    const [responsibles, total] = await Promise.all([
      db.supplierResponsible.findMany({
        where,
        skip,
        take: limit,
      }),
      db.supplierResponsible.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      responsibles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  },

  async getByEmail({ supplierId, email }: { supplierId: string; email: string }) {
    const responsible = await db.supplierResponsible.findFirst({
      where: {
        supplierId,
        email,
      },
    })

    if (!responsible) {
      throw new Error('Responsible not found with this email for this supplier')
    }

    return responsible
  },

  async getByCpf({ supplierId, cpf }: { supplierId: string; cpf: string }) {
    const responsible = await db.supplierResponsible.findFirst({
      where: {
        supplierId,
        cpf,
      },
    })

    if (!responsible) {
      throw new Error('Responsible not found with this CPF for this supplier')
    }

    return responsible
  },

  async getActive({ supplierId }: { supplierId: string }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return await db.supplierResponsible.findMany({
      where: {
        supplierId,
        status: true,
      },
      orderBy: { name: 'asc' },
    })
  },

  async getStats({ supplierId }: { supplierId: string }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const [total, active, inactive] = await Promise.all([
      db.supplierResponsible.count({
        where: { supplierId },
      }),
      db.supplierResponsible.count({
        where: { supplierId, status: true },
      }),
      db.supplierResponsible.count({
        where: { supplierId, status: false },
      }),
    ])

    return {
      total,
      active,
      inactive,
    }
  },

  async search({
    supplierId,
    searchTerm,
    limit,
  }: { supplierId: string; searchTerm: string; limit: number }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return await db.supplierResponsible.findMany({
      where: {
        supplierId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { cpf: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    })
  },

  async getBySupplier({ supplierId }: { supplierId: string }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return await db.supplierResponsible.findMany({
      where: { supplierId },
      orderBy: { name: 'asc' },
    })
  },

  async getRecent({ supplierId, limit }: { supplierId: string; limit: number }) {
    // Verificar se o supplier existe
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return await db.supplierResponsible.findMany({
      where: { supplierId },
      take: limit,
    })
  },
}
