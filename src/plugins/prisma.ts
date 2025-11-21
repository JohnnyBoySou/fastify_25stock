import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Criar pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Criar adaptador Prisma para PostgreSQL
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
export const db = prisma

export async function dbPlugin(app: FastifyInstance) {
  app.decorate('db', db as any)

  app.addHook('onClose', async () => {
    await db.$disconnect()
    await pool.end()
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
