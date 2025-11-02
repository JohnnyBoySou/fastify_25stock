import { Middlewares } from '@/middlewares'
import type { FastifyInstance } from 'fastify'
import { InvoiceController } from './invoice.controller'
import { InvoiceSchemas } from './invoice.schema'

export async function InvoiceRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // CRUD básico
  fastify.post('/', {
    schema: InvoiceSchemas.create,
    handler: InvoiceController.create,
  })

  fastify.get('/', {
    schema: InvoiceSchemas.list,
    handler: InvoiceController.list,
  })

  fastify.get('/:id', {
    schema: InvoiceSchemas.get,
    handler: InvoiceController.get,
  })

  fastify.delete('/:id', {
    schema: InvoiceSchemas.delete,
    handler: InvoiceController.delete,
  })

  // Funções adicionais
  fastify.get('/customer/:customerId', {
    schema: InvoiceSchemas.getByCustomer,
    handler: InvoiceController.getByCustomer,
  })

  fastify.get('/pending', {
    handler: InvoiceController.getPending,
  })

  fastify.get('/failed', {
    handler: InvoiceController.getFailed,
  })

  fastify.get('/overdue', {
    handler: InvoiceController.getOverdue,
  })

  fastify.get('/stats', {
    handler: InvoiceController.getStats,
  })

  fastify.get('/revenue', {
    schema: InvoiceSchemas.getRevenue,
    handler: InvoiceController.getRevenue,
  })

  fastify.get('/:id/pdf', {
    schema: InvoiceSchemas.getPdf,
    handler: InvoiceController.getPdf,
  })

  fastify.patch('/:id/status', {
    schema: InvoiceSchemas.updateStatus,
    handler: InvoiceController.updateStatus,
  })

  fastify.post('/:id/retry', {
    schema: InvoiceSchemas.updateStatus,
    handler: InvoiceController.updateStatusRetry,
  })

  fastify.post('/:id/send-email', {
    schema: InvoiceSchemas.sendEmail,
    handler: InvoiceController.sendEmail,
  })

  fastify.patch('/:id/mark-paid', {
    schema: InvoiceSchemas.markAsPaid,
    handler: InvoiceController.markAsPaid,
  })

  fastify.patch('/:id/mark-failed', {
    schema: InvoiceSchemas.markAsFailed,
    handler: InvoiceController.markAsFailed,
  })
}
