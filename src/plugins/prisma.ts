import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '../generated/prisma'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
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
