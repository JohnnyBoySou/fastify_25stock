import { db } from '@/plugins/prisma'
import { FlowEntity, type FlowStatus } from '../flow.interfaces'

export const FlowCommands = {
  async create(data: {
    name: string
    description?: string
    nodes: any[]
    edges: any[]
    status: FlowStatus
    storeId: string
    createdBy: string
  }) {
    try {
      // Validar se a loja existe
      const store = await db.store.findUnique({
        where: { id: data.storeId },
      })

      if (!store) {
        throw new Error('Store not found')
      }

      // Validar se o usuário criador existe
      const user = await db.user.findUnique({
        where: { id: data.createdBy },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Criar flow
      const flow = await db.flow.create({
        data: {
          name: data.name,
          description: data.description,
          nodes: data.nodes as any,
          edges: data.edges as any,
          status: data.status,
          storeId: data.storeId,
          createdBy: data.createdBy,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return flow
    } catch (error: any) {
      console.error('Error creating flow:', error)
      throw error
    }
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      nodes?: any[]
      edges?: any[]
      status?: FlowStatus
    }
  ) {
    try {
      // Verificar se o flow existe
      const existingFlow = await db.flow.findUnique({
        where: { id },
      })

      if (!existingFlow) {
        throw new Error('Flow not found')
      }

      // Atualizar flow
      const flow = await db.flow.update({
        where: { id },
        data: {
          ...data,
          nodes: data.nodes as any,
          edges: data.edges as any,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return flow
    } catch (error: any) {
      console.error('Error updating flow:', error)
      throw error
    }
  },

  async delete(id: string) {
    try {
      // Verificar se o flow existe
      const existingFlow = await db.flow.findUnique({
        where: { id },
      })

      if (!existingFlow) {
        throw new Error('Flow not found')
      }

      // Deletar flow (o Prisma vai deletar em cascata os flowNodes)
      await db.flow.delete({
        where: { id },
      })

      return { id }
    } catch (error: any) {
      console.error('Error deleting flow:', error)
      throw error
    }
  },

  async updateStatus(id: string, status: FlowStatus) {
    try {
      // Verificar se o flow existe
      const existingFlow = await db.flow.findUnique({
        where: { id },
      })

      if (!existingFlow) {
        throw new Error('Flow not found')
      }

      // Atualizar apenas o status
      const flow = await db.flow.update({
        where: { id },
        data: { status },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return flow
    } catch (error: any) {
      console.error('Error updating flow status:', error)
      throw error
    }
  },

  async duplicate(id: string, newName?: string) {
    try {
      // Buscar flow original
      const originalFlow = await db.flow.findUnique({
        where: { id },
      })

      if (!originalFlow) {
        throw new Error('Flow not found')
      }

      // Criar flow duplicado
      const duplicatedFlow = await db.flow.create({
        data: {
          name: newName || `${originalFlow.name} (Copy)`,
          description: originalFlow.description,
          nodes: originalFlow.nodes as any,
          edges: originalFlow.edges as any,
          status: 'DRAFT', // Sempre DRAFT ao duplicar
          storeId: originalFlow.storeId,
          createdBy: originalFlow.createdBy,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return duplicatedFlow
    } catch (error: any) {
      console.error('Error duplicating flow:', error)
      throw error
    }
  },
}
