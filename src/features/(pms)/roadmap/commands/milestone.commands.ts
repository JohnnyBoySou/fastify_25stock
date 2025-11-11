import { db } from '@/plugins/prisma'

export const MilestoneCommands = {
  async create(data: {
    roadmapId: string
    title: string
    description?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
    progress?: number
    order?: number
    startDate?: Date
    endDate?: Date
  }) {
    // Verifica se o roadmap existe
    const roadmap = await db.roadmap.findUnique({
      where: { id: data.roadmapId },
    })

    if (!roadmap) {
      throw new Error('Roadmap not found')
    }

    // Se order não foi especificado, coloca no final
    if (data.order === undefined) {
      const lastMilestone = await db.milestone.findFirst({
        where: { roadmapId: data.roadmapId },
        orderBy: { order: 'desc' },
      })
      data.order = lastMilestone ? lastMilestone.order + 1 : 0
    }

    return await db.milestone.create({
      data: {
        roadmapId: data.roadmapId,
        title: data.title,
        description: data.description,
        status: data.status || 'PENDING',
        progress: data.progress || 0,
        order: data.order,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })
  },

  async update(
    id: string,
    roadmapId: string,
    data: {
      title?: string
      description?: string
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
      progress?: number
      order?: number
      startDate?: Date
      endDate?: Date
    }
  ) {
    // Verifica se a milestone existe e pertence ao roadmap
    const milestone = await db.milestone.findFirst({
      where: {
        id,
        roadmapId,
      },
    })

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    // Se status mudou para COMPLETED, seta completedAt
    const updateData: any = { ...data }
    if (data.status === 'COMPLETED' && milestone.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
      updateData.progress = 100
    }

    return await db.milestone.update({
      where: { id },
      data: updateData,
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })
  },

  async delete(id: string, roadmapId: string) {
    // Verifica se a milestone existe e pertence ao roadmap
    const milestone = await db.milestone.findFirst({
      where: {
        id,
        roadmapId,
      },
    })

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    return await db.milestone.delete({
      where: { id },
    })
  },

  async updateProgress(id: string, roadmapId: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100')
    }

    // Verifica se a milestone existe e pertence ao roadmap
    const milestone = await db.milestone.findFirst({
      where: {
        id,
        roadmapId,
      },
    })

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    const updateData: any = { progress }

    // Se chegou a 100%, marca como COMPLETED
    if (progress === 100 && milestone.status !== 'COMPLETED') {
      updateData.status = 'COMPLETED'
      updateData.completedAt = new Date()
    }

    // Se era COMPLETED e caiu de 100%, volta para IN_PROGRESS
    if (progress < 100 && milestone.status === 'COMPLETED') {
      updateData.status = 'IN_PROGRESS'
      updateData.completedAt = null
    }

    return await db.milestone.update({
      where: { id },
      data: updateData,
    })
  },

  async updateStatus(
    id: string,
    roadmapId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  ) {
    // Verifica se a milestone existe e pertence ao roadmap
    const milestone = await db.milestone.findFirst({
      where: {
        id,
        roadmapId,
      },
    })

    if (!milestone) {
      throw new Error('Milestone not found')
    }

    const updateData: any = { status }

    // Se mudou para COMPLETED
    if (status === 'COMPLETED' && milestone.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
      updateData.progress = 100
    }

    // Se saiu de COMPLETED
    if (status !== 'COMPLETED' && milestone.status === 'COMPLETED') {
      updateData.completedAt = null
    }

    return await db.milestone.update({
      where: { id },
      data: updateData,
    })
  },

  async reorder(roadmapId: string, milestoneIds: string[]) {
    // Verifica se todas as milestones pertencem ao roadmap
    const milestones = await db.milestone.findMany({
      where: {
        id: { in: milestoneIds },
        roadmapId,
      },
    })

    if (milestones.length !== milestoneIds.length) {
      throw new Error('Some milestones not found or do not belong to this roadmap')
    }

    // Atualiza a ordem de cada milestone
    const updates = milestoneIds.map((id, index) =>
      db.milestone.update({
        where: { id },
        data: { order: index },
      })
    )

    return await db.$transaction(updates)
  },
}
