import { db } from '@/plugins/prisma'

export const SupportQueries = {
    async findById(supportId: string) {
        const support = await db.supportTicket.findUnique({
            where: { id: supportId },
        })
        return support
    },

    async findByAll(page: number, limit: number) {
        const supports = await db.supportTicket.findMany({
            skip: (page - 1) * limit,
            take: limit,
        })
        return supports
    },

    async findByQuery(query: string, page: number, limit: number) {
        const supports = await db.supportTicket.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            skip: (page - 1) * limit,
            take: limit,
        })
        return supports
    },

    async findMessagesByTicketId(ticketId: string, page: number, limit: number) {
        const [messages, total] = await Promise.all([
            db.supportMessage.findMany({
                where: { ticketId },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db.supportMessage.count({
                where: { ticketId },
            }),
        ])

        return {
            items: messages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    },
}
