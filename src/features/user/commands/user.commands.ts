import { db } from '@/plugins/prisma'
import bcrypt from 'bcryptjs'

export const UserCommands = {
  async create(data: {
    email: string
    password: string
    name: string
    roles?: string[]
  }) {
    // Verificar se o usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Criar usuário
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    })

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
    }
  ) {
    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    const updateData = { ...data }

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

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
        isOwner: true,
      },
    })

    return user
  },

  async delete(id: string) {
    // Verificar se o usuário existe
    const existingUser = await db.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    // Soft delete - apenas desativar o usuário
    await db.user.update({
      where: { id },
      data: { status: false },
    })

    return { success: true }
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
