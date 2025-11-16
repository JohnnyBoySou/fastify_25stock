import { db } from '@/plugins/prisma'

export const FolderCommands = {
  async create(data: {
    storeId: string
    name: string
    description?: string
    color?: string
    icon?: string
    parentId?: string
    createdById?: string
  }) {
    // Verificar se já existe uma pasta com o mesmo nome na mesma store
    const existingFolder = await db.folder.findFirst({
      where: {
        storeId: data.storeId,
        name: data.name,
        deletedAt: null,
      },
    })

    if (existingFolder) {
      throw new Error('Folder with this name already exists')
    }

    // Se parentId foi fornecido, verificar se existe
    if (data.parentId) {
      const parent = await db.folder.findFirst({
        where: {
          id: data.parentId,
          storeId: data.storeId,
          deletedAt: null,
        },
      })

      if (!parent) {
        throw new Error('Parent folder not found')
      }
    }

    // Construir objeto data sem incluir campos null/undefined
    const createData: any = {
      storeId: data.storeId,
      name: data.name,
    }

    if (data.description !== undefined) {
      createData.description = data.description
    }
    if (data.color !== undefined) {
      createData.color = data.color
    }
    if (data.icon !== undefined) {
      createData.icon = data.icon
    }
    if (data.parentId !== null && data.parentId !== undefined) {
      createData.parentId = data.parentId
    }
    if (data.createdById !== null && data.createdById !== undefined) {
      createData.createdById = data.createdById
    }

    return await db.folder.create({
      data: createData,
      include: {
        parent: true,
        children: true,
        documents: {
          where: {
            deletedAt: null,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      description?: string
      color?: string
      icon?: string
      parentId?: string
    }
  ) {
    // Verificar se a pasta existe
    const folder = await db.folder.findUnique({
      where: { id },
    })

    if (!folder) {
      throw new Error('Folder not found')
    }

    // Se name foi alterado, verificar se não existe duplicata
    if (data.name && data.name !== folder.name) {
      const existingFolder = await db.folder.findFirst({
        where: {
          storeId: folder.storeId,
          name: data.name,
          deletedAt: null,
          id: { not: id },
        },
      })

      if (existingFolder) {
        throw new Error('Folder with this name already exists')
      }
    }

    // Se parentId foi fornecido, verificar se existe e não causa loop
    if (data.parentId) {
      if (data.parentId === id) {
        throw new Error('Folder cannot be its own parent')
      }

      const parent = await db.folder.findFirst({
        where: {
          id: data.parentId,
          storeId: folder.storeId,
          deletedAt: null,
        },
      })

      if (!parent) {
        throw new Error('Parent folder not found')
      }

      // Verificar se não está tentando mover uma pasta para dentro de si mesma ou seus descendentes
      const checkCircular = async (folderId: string, parentId: string): Promise<boolean> => {
        if (folderId === parentId) {
          return true
        }

        const currentFolder = await db.folder.findUnique({
          where: { id: folderId },
          select: { parentId: true },
        })

        if (currentFolder?.parentId) {
          return checkCircular(currentFolder.parentId, parentId)
        }

        return false
      }

      const wouldCreateCycle = await checkCircular(data.parentId, id)
      if (wouldCreateCycle) {
        throw new Error('Cannot move folder: would create circular reference')
      }
    }

    // Construir objeto data sem incluir campos undefined
    const updateData: any = {}
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }
    if (data.color !== undefined) {
      updateData.color = data.color
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon
    }
    // Se parentId for null, definir explicitamente como null para remover o parent
    // Se for undefined, não incluir no objeto
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId
    }

    return await db.folder.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
        documents: {
          where: {
            deletedAt: null,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async delete(id: string) {
    // Verificar se a pasta existe
    const folder = await db.folder.findUnique({
      where: { id },
      include: {
        documents: {
          where: {
            deletedAt: null,
          },
        },
        children: {
          where: {
            deletedAt: null,
          },
        },
      },
    })

    if (!folder) {
      throw new Error('Folder not found')
    }

    // Se a pasta tem documentos ou subpastas, não permitir deletar
    if (folder.documents.length > 0) {
      throw new Error('Cannot delete folder: it contains documents')
    }

    if (folder.children.length > 0) {
      throw new Error('Cannot delete folder: it contains subfolders')
    }

    // Soft delete: apenas marcar como deletado
    return await db.folder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  },

  async forceDelete(id: string) {
    // Verificar se a pasta existe
    const folder = await db.folder.findUnique({
      where: { id },
    })

    if (!folder) {
      throw new Error('Folder not found')
    }

    // Hard delete: remover permanentemente (cascade do Prisma cuidará dos relacionamentos)
    return await db.folder.delete({
      where: { id },
    })
  },
}
