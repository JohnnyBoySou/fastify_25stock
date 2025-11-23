import { db } from '@/plugins/prisma'
import bcrypt from 'bcryptjs'
import { EmailService } from '@/services/email/email.service'

export const UserCommands = {
  async bulkDelete(ids: string[]) {
    const result = await db.user.deleteMany({
      where: { id: { in: ids } },
    })
    return result
  },

  async create(data: {
    email: string
    name: string
    storeId?: string
  }) {
    // Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const password = Math.random().toString(36).substring(2, 15)
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário - associar à loja se storeId foi fornecido
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        status: true,
        isOwner: false,
        emailVerified: true,
        storeId: data.storeId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        storeId: true,
        createdAt: true,
      },
    })

    // Enviar email com senha inicial
    try {
      const loginUrl =
        process.env.FRONTEND_URL || process.env.APP_URL || 'https://app.25stock.com/login'
      await EmailService.sendInitialPasswordEmail({
        name: user.name,
        email: user.email,
        password: password,
        loginUrl: loginUrl,
      })
    } catch (error) {
      // Log do erro mas não falha a criação do usuário
      console.error('Error sending initial password email:', error)
    }

    return user
  },

  async update(
    id: string,
    data: {
      email?: string
      password?: string
      name?: string
      roles?: string[]
      status?: boolean
      emailVerified?: boolean
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
    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    const updateData: any = { ...data }

    // Se uma nova senha foi fornecida, fazer hash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12)
    }

    // Se email foi alterado, verificar se já existe
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: updateData.email },
      })

      if (emailExists) {
        throw new Error('Email already exists')
      }
    }

    // Processar campos de endereço
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
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
        isOwner: true,
      },
    })

    return user
  },

  async delete(id: string) {
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    await db.user.delete({
      where: { id },
    })

    return true
  },

  async verifyEmail(id: string) {
    const user = await db.user.update({
      where: { id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        updatedAt: true,
      },
    })

    return user
  },

  async updateLastLogin(id: string) {
    await db.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })

    return { success: true }
  },
}
