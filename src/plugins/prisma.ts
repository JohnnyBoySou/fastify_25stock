import { PrismaClient } from '../generated/prisma'
import type { FastifyInstance } from 'fastify'

export const prisma = new PrismaClient()
export const db = prisma

export async function dbPlugin(app: FastifyInstance) {
  app.decorate('db', db as any)

  app.addHook('onClose', async () => {
    await db.$disconnect()
  })
}

export async function connectDb() {
  try {
    await db.$connect()
  } catch (error) {
    console.error('Falha ao conectar com o banco de dados:', error)
    throw error
  }
}
