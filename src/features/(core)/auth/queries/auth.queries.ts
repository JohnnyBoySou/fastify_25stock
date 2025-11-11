import { prisma } from '@/plugins/prisma'
import type { AuthUser } from '../auth.interfaces'

export const AuthQueries = {
  async getById(id: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id, status: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,

        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  },

  async getByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { email, status: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,

        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  },

  async getByResetToken(token: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
        status: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  },

  async getByVerificationToken(token: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerified: false,
        status: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,

        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  },
}
