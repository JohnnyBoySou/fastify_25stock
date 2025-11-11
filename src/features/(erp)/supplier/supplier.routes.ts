import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { SupplierResponsibleRoutes } from './supplier-responsible.routes'
import { SupplierController } from './supplier.controller'
import { SupplierSchemas } from './supplier.schema'

export async function SupplierRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: SupplierSchemas.create,

    handler: SupplierController.create,
  })

  fastify.get('/', {
    schema: SupplierSchemas.list,

    handler: SupplierController.list,
  })

  fastify.get('/:id', {
    schema: SupplierSchemas.get,

    handler: SupplierController.get,
  })

  fastify.put('/:id', {
    schema: SupplierSchemas.update,

    handler: SupplierController.update,
  })

  fastify.delete('/:id', {
    schema: SupplierSchemas.delete,

    handler: SupplierController.delete,
  })

  // Funções adicionais
  fastify.get('/cnpj/:cnpj', {
    schema: SupplierSchemas.getByCnpj,

    handler: SupplierController.getByCnpj,
  })

  fastify.get('/city/:city', {
    schema: SupplierSchemas.getByCity,

    handler: SupplierController.getByCity,
  })

  fastify.get('/state/:state', {
    schema: SupplierSchemas.getByState,

    handler: SupplierController.getByState,
  })

  fastify.get('/active', {
    handler: SupplierController.getActive,
  })

  fastify.get('/stats', {
    handler: SupplierController.getStats,
  })

  fastify.get('/search', {
    schema: SupplierSchemas.search,

    handler: SupplierController.search,
  })

  fastify.get('/top', {
    handler: SupplierController.getTopSuppliers,
  })

  fastify.patch('/:id/toggle-status', {
    schema: SupplierSchemas.get,

    handler: SupplierController.toggleStatus,
  })

  // Registrar rotas de responsáveis
  await fastify.register(SupplierResponsibleRoutes)
}
