import { db } from '@/plugins/prisma'

export const ProfileCommands = {
  async update(userId: string, data: { name?: string; email?: string; phone?: string }) {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
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
