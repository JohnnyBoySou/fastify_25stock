import type { FastifyInstance } from 'fastify'
import { UploadController } from './upload.controller'
import { createUploadSchema, getEntityMediaSchema, listUploadsSchema } from './upload.schema'

import { Middlewares } from '@/middlewares'

export async function UploadRoutes(fastify: FastifyInstance) {
  // Middlewares para todas as rotas
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // === REGISTRAR PLUGIN MULTIPART ===
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10, // máximo 10 arquivos por request
    },
    attachFieldsToBody: false, // Manter arquivos separados do body
    sharedSchemaId: 'MultipartFileType', // Schema para validação
  })

  // === CRUD BÁSICO ===
  fastify.post('/', {
    schema: createUploadSchema,
    handler: UploadController.create,
  })

  fastify.get('/', {
    schema: listUploadsSchema,
    handler: UploadController.list,
  })

  fastify.get('/:id', {
    handler: UploadController.get,
  })

  fastify.put('/:id', {
    handler: UploadController.update,
  })

  fastify.delete('/:id', {
    handler: UploadController.delete,
  })

  // === UPLOAD DE ARQUIVOS FÍSICOS ===
  fastify.post('/upload', {
    handler: UploadController.uploadSingle,
  })

  fastify.post('/upload-multiple', {
    handler: UploadController.uploadMultiple,
  })

  // === FUNÇÕES ADICIONAIS ===

  // Buscar por tipo
  fastify.get('/type/:type', {
    handler: UploadController.getByType,
  })

  // Buscar recentes
  fastify.get('/recent', {
    handler: UploadController.getRecent,
  })

  // Estatísticas
  fastify.get('/stats', {
    handler: UploadController.getStats,
  })

  // Buscar mídia
  fastify.get('/search', {
    handler: UploadController.search,
  })

  // Uso da mídia
  fastify.get('/:id/usage', {
    handler: UploadController.getMediaUsage,
  })

  // Mídias não utilizadas
  fastify.get('/unused', {
    handler: UploadController.getUnusedMedia,
  })

  // === GESTÃO DE ANEXOS ===

  // Anexar mídia a uma entidade
  fastify.post('/:id/attach', {
    handler: UploadController.attachMedia,
  })

  // Desanexar mídia de uma entidade
  fastify.post('/:id/detach', {
    handler: UploadController.detachMedia,
  })

  // Definir mídia principal (apenas para produtos)
  fastify.patch('/:id/set-primary', {
    handler: UploadController.setPrimaryMedia,
  })

  // Obter mídias de uma entidade
  fastify.get('/entity/:entityType/:entityId', {
    schema: getEntityMediaSchema,
    handler: UploadController.getEntityMedia,
  })

  // Obter mídia principal de uma entidade
  fastify.get('/entity/:entityType/:entityId/primary', {
    handler: UploadController.getPrimaryMedia,
  })

  // === OPERAÇÕES EM LOTE ===

  // Deletar múltiplas mídias
  fastify.post('/bulk-delete', {
    handler: UploadController.bulkDelete,
  })

  // === SERVIÇOS DE MANUTENÇÃO ===

  // Limpeza de arquivos órfãos
  fastify.post('/cleanup-orphaned', {
    handler: UploadController.cleanupOrphanedFiles,
  })

  // Configuração do serviço
  fastify.get('/service/config', {
    handler: UploadController.getServiceConfig,
  })

  // Estatísticas do sistema de arquivos
  fastify.get('/service/stats', {
    handler: UploadController.getFileSystemStats,
  })
}
