import type { FastifyInstance } from 'fastify'
import { GalleryController } from './gallery.controller'
import { GallerySchemas } from './gallery.schema'

import { Middlewares } from '@/middlewares'

export async function GalleryRoutes(fastify: FastifyInstance) {
  // Registrar multipart ANTES dos hooks para garantir que funcione corretamente
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10, // máximo 10 arquivos por request
    },
    attachFieldsToBody: false, // Manter arquivos separados do body
    sharedSchemaId: 'MultipartFileType', // Schema para validação
  })

  // Hooks após o registro do multipart
  fastify.addHook('preHandler', Middlewares.auth)
  fastify.addHook('preHandler', Middlewares.store)

  // === CRUD BÁSICO ===
  fastify.post('/', {
    preHandler: [Middlewares.permission('GALLERY', 'CREATE')],
    schema: GallerySchemas.create,
    handler: GalleryController.create,
  })

  fastify.get('/', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    schema: GallerySchemas.findAll,
    handler: GalleryController.findAll,
  })

  fastify.get('/:id', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    schema: GallerySchemas.findById,
    handler: GalleryController.findById,
  })

  fastify.put('/:id', {
    preHandler: [Middlewares.permission('GALLERY', 'UPDATE')],
    schema: GallerySchemas.update,
    handler: GalleryController.update,
  })

  fastify.delete('/:id', {
    preHandler: [Middlewares.permission('GALLERY', 'DELETE')],
    schema: GallerySchemas.remove,
    handler: GalleryController.remove,
  })

  // === UPLOAD DE ARQUIVOS FÍSICOS ===
  fastify.post('/upload', {
    preHandler: [Middlewares.permission('GALLERY', 'CREATE')],
    handler: GalleryController.uploadSingle,
  })

  fastify.post('/upload-multiple', {
    preHandler: [Middlewares.permission('GALLERY', 'CREATE')],
    handler: GalleryController.uploadMultiple,
  })

  // === FUNÇÕES ADICIONAIS ===

  // Buscar por tipo
  fastify.get('/type/:type', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getByType,
  })

  // Buscar recentes
  fastify.get('/recent', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getRecent,
  })

  // Estatísticas
  fastify.get('/stats', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getStats,
  })

  // Buscar mídia
  fastify.get('/search', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.search,
  })

  // Uso da mídia
  fastify.get('/:id/usage', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getMediaUsage,
  })

  // Mídias não utilizadas
  fastify.get('/unused', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getUnusedMedia,
  })

  // === GESTÃO DE ANEXOS ===

  // Anexar mídia a uma entidade
  fastify.post('/:id/attach', {
    preHandler: [Middlewares.permission('GALLERY', 'CREATE')],
    handler: GalleryController.attachMedia,
  })

  // Desanexar mídia de uma entidade
  fastify.post('/:id/detach', {
    preHandler: [Middlewares.permission('GALLERY', 'UPDATE')],
    handler: GalleryController.detachMedia,
  })

  // Definir mídia principal (apenas para produtos)
  fastify.patch('/:id/set-primary', {
    preHandler: [Middlewares.permission('GALLERY', 'UPDATE')],
    handler: GalleryController.setPrimaryMedia,
  })

  // Obter mídias de uma entidade
  fastify.get('/entity/:entityType/:entityId', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    schema: GallerySchemas.getEntityMedia,
    handler: GalleryController.getEntityMedia,
  })

  // Obter mídia principal de uma entidade
  fastify.get('/entity/:entityType/:entityId/primary', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getPrimaryMedia,
  })

  // === OPERAÇÕES EM LOTE ===

  // Deletar múltiplas mídias
  fastify.post('/bulk-delete', {
    preHandler: [Middlewares.permission('GALLERY', 'DELETE')],
    handler: GalleryController.bulkDelete,
  })

  // === SERVIÇOS DE MANUTENÇÃO ===

  // Limpeza de arquivos órfãos
  fastify.post('/cleanup-orphaned', {
    preHandler: [Middlewares.permission('GALLERY', 'DELETE')],
    handler: GalleryController.cleanupOrphanedFiles,
  })

  // Configuração do serviço
  fastify.get('/service/config', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getServiceConfig,
  })

  // Estatísticas do sistema de arquivos
  fastify.get('/service/stats', {
    preHandler: [Middlewares.permission('GALLERY', 'READ')],
    handler: GalleryController.getFileSystemStats,
  })
}
