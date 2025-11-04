import path from 'node:path'
import Fastify from 'fastify'

import cors from '@fastify/cors'
import fastifyRawBody from 'fastify-raw-body'
import fastifyStatic from '@fastify/static'

// Plugins
import { connectDb } from './plugins/prisma'
import { registerPlugins } from './plugins'

// Bootstrap UI
import { bootstrapUI } from './utils/bootstrap'

// Router
import { registerRoutes } from './router'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
              singleLine: true,
            },
          }
        : undefined,
  },
  requestTimeout: 60000, // 30 segundos para timeout de requisições
  keepAliveTimeout: 5000, // 5 segundos para keep-alive
  bodyLimit: 1048576, // 1MB para limite do body
  routerOptions: {
    maxParamLength: 200, // Limite de caracteres para parâmetros de rota
  },
})

// Healthcheck route (registrada antes do bootstrap)
fastify.get('/health', async (request, reply) => {
  try {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: 'Database connection failed',
    })
  }
})

const PORT = Number(process.env.PORT) || 3000
const HOST = '0.0.0.0'

const closeGracefully = async (signal: string) => {
  console.log(`\n⚠️  Recebido sinal ${signal}, encerrando servidor...`)

  try {
    await fastify.close()
    console.log('✅ Servidor encerrado com sucesso')
    process.exit(0)
  } catch (err) {
    console.error('❌ Erro ao encerrar servidor:', err)
    process.exit(1)
  }
}

process.on('SIGINT', () => closeGracefully('SIGINT'))
process.on('SIGTERM', () => closeGracefully('SIGTERM'))
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  bootstrapUI.showError('Uncaught Exception', err)
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
  bootstrapUI.showError('Unhandled Rejection', reason)
  process.exit(1)
})

async function startServer() {
  const success = await bootstrapUI.run([
    {
      name: '✅ Conectando ao banco de dados',
      action: async () => {
        await connectDb()
      },
    },
    {
      name: '✅ Registrando plugins',
      action: async () => {
        await registerPlugins(fastify)
      },
    },
    {
      name: '✅ Configurando CORS',
      action: async () => {
        await fastify.register(cors, {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        })
      },
    },
    {
      name: '✅ Registrando raw body parser',
      action: async () => {
        await fastify.register(fastifyRawBody, {
          field: 'rawBody',
          global: true,
          encoding: 'utf8',
          runFirst: true,
        })
      },
    },
    {
      name: '✅ Configurando arquivos estáticos',
      action: async () => {
        await fastify.register(fastifyStatic, {
          root: path.resolve(process.env.STORAGE_PATH || 'src/uploads'),
          prefix: '/uploads/',
          decorateReply: false,
        })
      },
    },
    {
      name: '✅ Registrando rotas',
      action: async () => {
        await registerRoutes(fastify)
      },
    },
    {
      name: '✅ Configurando sistema de logs',
      action: () => {
        bootstrapUI.setupFastifyHooks(fastify)
      },
    },
    {
      name: '✅ Iniciando servidor',
      action: async () => {
        await fastify.listen({ port: PORT, host: HOST })
      },
    },
  ])

  if (!success) {
    bootstrapUI.showError('❌ Falha ao inicializar o servidor')
    process.exit(1)
  }

  bootstrapUI.showServerInfo(fastify, PORT, HOST)
}

startServer().catch((err) => {
  console.error('❌ Erro fatal ao iniciar o servidor:', err)
  bootstrapUI.showError('❌ Erro fatal ao iniciar o servidor', err)
  process.exit(1)
})
