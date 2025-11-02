import type { FastifyInstance } from 'fastify'
import webpush, { type PushSubscription, type SendResult } from 'web-push'

// Configurar as VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

// Configurar web-push globalmente
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
} else {
  console.warn('⚠️ VAPID keys não configuradas. Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY')
}

// Exportar função para enviar notificação diretamente
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
    actions?: Array<{
      action: string
      title: string
      icon?: string
    }>
  }
): Promise<SendResult> {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
      actions: payload.actions,
    })

    const result = await webpush.sendNotification(subscription, notificationPayload)
    return result
  } catch (error: any) {
    if (error.statusCode === 410) {
      throw new Error('Push subscription expired or invalid')
    }
    throw error
  }
}

export const pushPlugin = async (fastify: FastifyInstance) => {
  // Adicionar método para enviar notificação push
  fastify.decorate(
    'sendPushNotification',
    async (
      subscription: PushSubscription,
      payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: any
        actions?: Array<{
          action: string
          title: string
          icon?: string
        }>
      }
    ): Promise<SendResult> => {
      try {
        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          data: payload.data,
          actions: payload.actions,
        })

        const result = await webpush.sendNotification(subscription, notificationPayload)

        fastify.log.info('Push notification sent successfully')
        return result
      } catch (error: any) {
        fastify.log.error(`Error sending push notification: ${error.message}`)

        // Se a subscription expirou ou é inválida, retornar erro específico
        if (error.statusCode === 410) {
          fastify.log.warn('Push subscription expired or invalid')
        }

        throw error
      }
    }
  )

  // Adicionar método para enviar notificação push a múltiplos dispositivos
  fastify.decorate(
    'sendPushToSubscriptions',
    async (
      subscriptions: PushSubscription[],
      payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: any
        actions?: Array<{
          action: string
          title: string
          icon?: string
        }>
      }
    ): Promise<{ success: number; failed: number }> => {
      let success = 0
      let failed = 0

      await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            await (fastify as any).sendPushNotification(subscription, payload)
            success++
          } catch (error) {
            failed++
            fastify.log.error(`Failed to send push notification: ${error.message}`)
          }
        })
      )

      return { success, failed }
    }
  )

  // Adicionar método para validar subscription
  fastify.decorate('validatePushSubscription', (subscription: PushSubscription): boolean => {
    try {
      return !!(
        subscription.endpoint &&
        subscription.keys &&
        subscription.keys.p256dh &&
        subscription.keys.auth
      )
    } catch {
      return false
    }
  })

  // Retornar VAPID public key para frontend
  fastify.decorate('getVapidPublicKey', (): string => {
    return vapidKeys.publicKey
  })
}

// Declaração de tipos para o TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    sendPushNotification: (
      subscription: PushSubscription,
      payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: any
        actions?: Array<{
          action: string
          title: string
          icon?: string
        }>
      }
    ) => Promise<SendResult>

    sendPushToSubscriptions: (
      subscriptions: PushSubscription[],
      payload: {
        title: string
        body: string
        icon?: string
        badge?: string
        data?: any
        actions?: Array<{
          action: string
          title: string
          icon?: string
        }>
      }
    ) => Promise<{ success: number; failed: number }>

    validatePushSubscription: (subscription: PushSubscription) => boolean

    getVapidPublicKey: () => string
  }
}

export { vapidKeys }
