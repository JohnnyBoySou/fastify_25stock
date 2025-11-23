import { db } from '@/plugins/prisma'

export const ProfileCommands = {
  async update(
    userId: string,
    data: {
      name?: string
      email?: string
      phone?: string | null
      birthDate?: string | null
      address?: string | null
      number?: string | null
      complement?: string | null
      city?: string | null
      state?: string | null
      country?: string | null
      cep?: string | null
    }
  ) {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    }
    if (data.address !== undefined) updateData.address = data.address
    if (data.number !== undefined) updateData.number = data.number
    if (data.complement !== undefined) updateData.complement = data.complement
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.country !== undefined) updateData.country = data.country
    if (data.cep !== undefined) updateData.cep = data.cep

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        address: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        country: true,
        cep: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      },
    })
    return user
  },
  async exclude(userId: string) {
    const user = await db.user.delete({
      where: { id: userId },
    })
    return user
  },
}
