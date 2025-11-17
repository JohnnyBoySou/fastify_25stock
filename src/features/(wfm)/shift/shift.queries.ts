import { db } from '@/plugins/prisma'
import { PaginationUtils } from '@/utils/pagination'

export const ShiftQueries = {
  async getAll(
    storeId: string,
    filters?: {
      occurrenceId?: string
      page?: number
      limit?: number
    }
  ) {
    const where: any = {
      storeId,
    }

    if (filters?.occurrenceId) {
      where.occurrenceId = filters.occurrenceId
    }

    const include = {
      store: {
        select: {
          id: true,
          name: true,
        },
      },
      occurrence: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          schedule: {
            select: {
              id: true,
              title: true,
              description: true,
              startTime: true,
              endTime: true,
              rrule: true,
              timezone: true,
              status: true,
              space: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    }

    const result = await PaginationUtils.paginate(db, 'shift', {
      where,
      include,
      orderBy: {
        createdAt: 'desc',
      },
      params: {
        page: filters?.page,
        limit: filters?.limit,
      },
      paginationOptions: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
      },
    })

    return PaginationUtils.transformPaginationResult(result, 'shifts')
  },

  async getById(id: string, storeId: string) {
    return await db.shift.findFirst({
      where: {
        id,
        storeId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        occurrence: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            schedule: {
              select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                rrule: true,
                timezone: true,
                status: true,
                space: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
  },

  async getByQuery(query: any, storeId: string) {
    const where: any = {
      storeId,
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.occurrenceId) {
      where.occurrenceId = query.occurrenceId
    }

    return await db.shift.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        occurrence: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            schedule: {
              select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                rrule: true,
                timezone: true,
                status: true,
                space: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      take: query?.limit ? Number.parseInt(query.limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async getParticipants(shiftId: string) {
    return await db.shiftParticipant.findMany({
      where: { shiftId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
}
