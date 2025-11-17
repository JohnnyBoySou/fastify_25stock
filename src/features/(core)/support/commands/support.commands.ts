import { db } from '@/plugins/prisma'

export const SupportCommands = {
    async create(data: { storeId: string; userId: string; title: string; description: string }) {
        const support = await db.supportTicket.create({
            data: {
                storeId: data.storeId,
                userId: data.userId,
                title: data.title,
                description: data.description,
            },
        })
        return support
    },
    async update(supportId: string, data: { title?: string; description?: string }) {
        const support = await db.supportTicket.update({
            where: { id: supportId },
            data: {
                title: data.title,
                description: data.description,
            },
        })
        return support
    },
    async remove(supportId: string) {
        const support = await db.supportTicket.delete({
            where: { id: supportId },
        })
        return support
    },
    
    async bulkRemove(supportIds: string[]) {
        const supports = await db.supportTicket.deleteMany({
            where: { id: { in: supportIds } },
        })
        return supports
    },
}
