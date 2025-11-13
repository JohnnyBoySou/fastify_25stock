import { PolarCommands } from '@/features/polar/commands/polar.commands'
import { PolarQueries } from '@/features/polar/queries/polar.queries'
import { db } from '@/plugins/prisma'

function generatePlaceholderCnpj(seed: string) {
  const numericPart = seed.replace(/\D/g, '')
  if (numericPart.length >= 14) {
    return numericPart.slice(0, 14)
  }

  const asciiDigits = seed
    .split('')
    .map((char) => (char.charCodeAt(0) % 10).toString())
    .join('')

  const combined = (numericPart + asciiDigits).padEnd(14, '0')
  return combined.slice(0, 14)
}
export const StoreCommands = {
  async create(data: {
    ownerId: string
    name: string
    cnpj: string
    email?: string
    phone?: string
    cep?: string
    city?: string
    state?: string
    address?: string
    status?: boolean
  }) {
    // Check if CNPJ already exists
    const existingStore = await db.store.findUnique({
      where: { cnpj: data.cnpj },
    })

    if (existingStore) {
      throw new Error('CNPJ already exists')
    }

    // Check if owner exists
    const owner = await db.user.findUnique({
      where: { id: data.ownerId },
    })

    if (!owner) {
      throw new Error('Owner not found')
    }

    const storeInclude = {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    } as const

    const store = await db.store.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        cnpj: data.cnpj,
        email: data.email || null,
        phone: data.phone || null,
        cep: data.cep || null,
        city: data.city || null,
        state: data.state || null,
        address: data.address || null,
        status: data.status !== undefined ? data.status : true,
      },
      include: storeInclude,
    })

    let storeWithPlan = store

    try {
      const freePlan = await PolarQueries.getFreePlan()

      if (freePlan) {
        const priceInterval =
          freePlan.recurringInterval === 'month'
            ? 'MONTHLY'
            : freePlan.recurringInterval === 'year'
            ? 'YEARLY'
            : null

        let polarCustomer = null
        if (owner.email) {
          polarCustomer = await PolarCommands.createCustomer({
            email: owner.email,
            name: owner.name || '',
            externalId: owner.id,
          })
        }

        let polarSubscription = null
        if (polarCustomer?.id) {
          polarSubscription = await PolarCommands.createSubscription({
            customerId: polarCustomer.id,
            productId: freePlan.id,
          })
        }

        await db.subscription.create({
          data: {
            storeId: store.id,
            status: 'ACTIVE',
            polarCustomerId: polarCustomer?.id || null,
            polarSubscriptionId: polarSubscription?.id || null,
            polarProductId: freePlan.id,
            polarPlanName: freePlan.name,
            priceAmount: 0,
            ...(priceInterval ? { priceInterval } : {}),
            currency: 'BRL',
          },
        })

        storeWithPlan = await db.store.update({
          where: { id: store.id },
          data: { plan: freePlan.name },
          include: storeInclude,
        })
      } else {
        console.warn('Nenhum plano default encontrado no Polar')
      }
    } catch (error) {
      console.error('Falha ao atribuir plano default à loja:', error)
    }

    return storeWithPlan
  },

  async update(
    id: string,
    data: {
      name?: string
      cnpj?: string
      email?: string
      phone?: string
      cep?: string
      city?: string
      state?: string
      address?: string
      status?: boolean
    }
  ) {
    // Check if store exists
    const existingStore = await db.store.findUnique({
      where: { id },
    })

    if (!existingStore) {
      throw new Error('Store not found')
    }

    // If updating CNPJ, check if it already exists
    if (data.cnpj && data.cnpj !== existingStore.cnpj) {
      const cnpjExists = await db.store.findUnique({
        where: { cnpj: data.cnpj },
      })

      if (cnpjExists) {
        throw new Error('CNPJ already exists')
      }
    }

    return await db.store.update({
      where: { id },
      data: {
        ...data,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        cep: data.cep === '' ? null : data.cep,
        city: data.city === '' ? null : data.city,
        state: data.state === '' ? null : data.state,
        address: data.address === '' ? null : data.address,
      },
      include: {
        owner: {
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
    // Check if store exists
    const existingStore = await db.store.findUnique({
      where: { id },
    })

    if (!existingStore) {
      throw new Error('Store not found')
    }

    // Check if store has products
    const productCount = await db.product.count({
      where: { storeId: id },
    })

    if (productCount > 0) {
      throw new Error('Cannot delete store with existing products')
    }

    return await db.store.delete({
      where: { id },
    })
  },

  async defaultStore(data: { ownerId: string; ownerName?: string | null; ownerEmail?: string | null }) {
    const placeholderName = data.ownerName ? `Loja de ${data.ownerName}` : 'Minha Loja'
    const attempts = 3
    let lastError: any = null

    for (let attempt = 0; attempt < attempts; attempt++) {
      const seed = attempt === 0 ? data.ownerId : `${data.ownerId}-${Date.now()}-${attempt}`
      const placeholderCnpj = generatePlaceholderCnpj(seed)

      try {
        const store = await StoreCommands.create({
          ownerId: data.ownerId,
          name: placeholderName,
          cnpj: placeholderCnpj,
          email: data.ownerEmail || undefined,
          status: true,
        })

        return store
      } catch (error: any) {
        if (error?.message === 'CNPJ already exists') {
          lastError = error
          continue
        }
        throw error
      }
    }

    throw lastError || new Error('Failed to create default store')
  },

  async createCustomDomain(id: string, customDomain: string, cloudflareHostnameId: string | null, cloudflareStatus: string | null) {
    const storeWithCustomDomain = await db.store.update({
      where: { id },
      data: { customDomain, cloudflareHostnameId, cloudflareStatus },
    })
    return storeWithCustomDomain
  },
}
