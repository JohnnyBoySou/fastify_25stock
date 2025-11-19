import type { FastifyReply, FastifyRequest } from 'fastify'
import { SpaceCommands } from './space.commands'
import { SpaceQueries } from './space.queries'
import type { CreateSpaceRequest, UpdateSpaceRequest } from './space.interfaces'
import { GalleryCommands } from '@/features/(pms)/gallery/commands/gallery.commands'
import { db } from '@/plugins/prisma'

export const SpaceController = {
  async create(request: CreateSpaceRequest, reply: FastifyReply) {
    try {
      const {
        name,
        description,
        capacity,
        location,
        mediaId,
        minStartTime,
        minEndTime,
        minBookingDuration,
        gapTime,
        requiresApproval,
        allowOverlapping,
        maxSimultaneousBookings,
        resources,
      } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      if (!request.user?.id) {
        return reply.status(401).send({
          error: 'Authentication required',
        })
      }

      const space = await SpaceCommands.create({
        name,
        description,
        capacity,
        location,
        minStartTime,
        minEndTime,
        minBookingDuration,
        gapTime,
        requiresApproval,
        allowOverlapping,
        maxSimultaneousBookings,
        resources,
        storeId: request.store.id,
        createdById: request.user.id,
      })

      // Se mediaId foi fornecido, anexar a imagem ao space
      if (mediaId) {
        try {
          await GalleryCommands.attachToSpace({
            mediaId,
            entityType: 'space',
            entityId: space.id,
            isPrimary: true,
          })
        } catch (mediaError: any) {
          request.log.warn({ err: mediaError }, 'Erro ao anexar imagem ao space')
          // Não falha a criação do space se houver erro ao anexar a imagem
          // Apenas loga o erro
        }
      }

      // Buscar o space novamente com as mídias incluídas
      const spaceWithMedia = await SpaceQueries.getById(space.id, request.store.id)
      return reply.status(201).send(spaceWithMedia)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit } = request.query as { page?: number, limit?: number }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const spaces = await SpaceQueries.getAll({ page, limit }, request.store.id)
      return reply.status(200).send(spaces)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const space = await SpaceQueries.getById(id, request.store.id)

      if (!space) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      return reply.status(200).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async update(request: UpdateSpaceRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const {
        name,
        description,
        capacity,
        location,
        mediaId,
        minStartTime,
        minEndTime,
        minBookingDuration,
        gapTime,
        requiresApproval,
        allowOverlapping,
        maxSimultaneousBookings,
        resources,
      } = request.body

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const existingSpace = await SpaceQueries.getById(id, request.store.id)
      if (!existingSpace) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      // Atualizar os dados do space (sem mediaId)
    await SpaceCommands.update(id, {
        name,
        description,
        capacity,
        location,
        minStartTime,
        minEndTime,
        minBookingDuration,
        gapTime,
        requiresApproval,
        allowOverlapping,
        maxSimultaneousBookings,
        resources,
      })

      // Se mediaId foi fornecido, anexar/atualizar a imagem ao space
      if (mediaId) {
        try {
          // Verificar se já existe um relacionamento com este mediaId
          const existingMedia = await db.spaceMedia.findFirst({
            where: {
              spaceId: id,
              mediaId,
            },
          })

          if (existingMedia) {
            // Se já existe, apenas atualizar para primary se necessário
            await db.spaceMedia.update({
              where: { id: existingMedia.id },
              data: { isPrimary: true },
            })
            // Remover a flag de primary das outras mídias
            await db.spaceMedia.updateMany({
              where: {
                spaceId: id,
                id: { not: existingMedia.id },
              },
              data: { isPrimary: false },
            })
          } else {
            // Se não existe, criar novo relacionamento usando GalleryCommands
            await GalleryCommands.attachToSpace({
              mediaId,
              entityType: 'space',
              entityId: id,
              isPrimary: true,
            })
          }
        } catch (mediaError: any) {
          request.log.warn({ err: mediaError }, 'Erro ao anexar imagem ao space')
          // Não falha a atualização do space se houver erro ao anexar a imagem
          // Apenas loga o erro
        }
      }

      // Buscar o space novamente com as mídias incluídas
      const spaceWithMedia = await SpaceQueries.getById(id, request.store.id)
      return reply.status(200).send(spaceWithMedia)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      // Verificar se o space pertence à loja
      const existingSpace = await SpaceQueries.getById(id, request.store.id)
      if (!existingSpace) {
        return reply.status(404).send({
          error: 'Space not found',
        })
      }

      const space = await SpaceCommands.remove(id)
      return reply.status(200).send(space)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },

  async getByQuery(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit, query } = request.query as { page?: number, limit?: number, query?: string }

      if (!request.store?.id) {
        return reply.status(404).send({
          error: 'Store not found for this user',
        })
      }

      const spaces = await SpaceQueries.getByQuery({ page, limit, search: query }, request.store.id)
      return reply.status(200).send(spaces)
    } catch (error: any) {
      request.log.error(error)
      return reply.status(500).send({
        error: error.message || 'Internal server error',
      })
    }
  },
}
