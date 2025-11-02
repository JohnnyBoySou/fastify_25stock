import type { ActionConfig, ExecutionContext } from '@/features/flow/flow.interfaces'
import { db } from '@/plugins/prisma'
import { sendPushNotification } from '@/plugins/push'

export const ActionExecutor = {
  async executeAction(actionConfig: ActionConfig, context: ExecutionContext) {
    try {
      switch (actionConfig.type) {
        case 'email':
          return await this.sendEmail(actionConfig.config, context)
        case 'webhook':
          return await this.callWebhook(actionConfig.config, context)
        case 'internal_notification':
          return await this.sendInternalNotification(actionConfig.config, context)
        case 'sms':
          return await this.sendSMS(actionConfig.config, context)
        case 'push_notification':
          return await this.sendPushNotification(actionConfig.config, context)
        default:
          throw new Error(`Unknown action type: ${actionConfig.type}`)
      }
    } catch (error: any) {
      console.error(`Error executing ${actionConfig.type} action:`, error)
      throw error
    }
  },

  async sendEmail(config: any, context: ExecutionContext) {
    // Substituir variáveis no template
    const to = this.replaceVariables(config.to, context)
    const subject = this.replaceVariables(config.subject || '', context)
    const body = this.replaceVariables(config.body || '', context)

    // TODO: Implementar envio de email real
    // Por enquanto, apenas log
    console.log('📧 Sending email:', {
      to,
      subject,
      body,
    })

    return {
      success: true,
      type: 'email',
      to,
      subject,
      message: 'Email sent successfully (simulated)',
    }
  },

  async callWebhook(config: any, context: ExecutionContext) {
    if (!config.url) {
      throw new Error('Webhook URL is required')
    }

    const url = this.replaceVariables(config.url, context)
    const method = config.method || 'POST'
    const headers = config.headers || {}

    // Substituir variáveis no body
    let body = config.body
    if (body && typeof body === 'string') {
      body = this.replaceVariables(body, context)
    }

    // TODO: Implementar chamada HTTP real
    console.log('🔗 Calling webhook:', {
      url,
      method,
      headers,
      body,
    })

    // Simular requisição HTTP
    return {
      success: true,
      type: 'webhook',
      url,
      message: 'Webhook called successfully (simulated)',
    }
  },

  async sendInternalNotification(config: any, context: ExecutionContext) {
    if (!config.userIds || !Array.isArray(config.userIds) || config.userIds.length === 0) {
      throw new Error('User IDs are required for internal notification')
    }

    const title = this.replaceVariables(config.title || '', context)
    const message = this.replaceVariables(config.message || '', context)
    const priority = config.priority || 'MEDIUM'

    // Criar notificações independentes (como especificado)
    const notifications = await Promise.all(
      config.userIds.map(async (userId: string) => {
        const notification = await db.notification.create({
          data: {
            userId,
            title,
            message,
            type: 'SYSTEM',
            priority,
            data: {
              workflowContext: context,
              createdAt: new Date(),
            } as any,
          },
        })

        return notification
      })
    )

    return {
      success: true,
      type: 'internal_notification',
      notificationsCreated: notifications.length,
      message: `Internal notifications sent to ${notifications.length} user(s)`,
    }
  },

  async sendSMS(config: any, context: ExecutionContext) {
    if (!config.message) {
      throw new Error('SMS message is required')
    }

    const to = this.replaceVariables(config.to, context)
    const message = this.replaceVariables(config.message, context)

    // TODO: Implementar envio de SMS real
    console.log('📱 Sending SMS:', {
      to,
      message,
    })

    return {
      success: true,
      type: 'sms',
      to,
      message: 'SMS sent successfully (simulated)',
    }
  },

  async sendPushNotification(config: any, context: ExecutionContext) {
    if (!config.userIds || !Array.isArray(config.userIds) || config.userIds.length === 0) {
      throw new Error('User IDs are required for push notification')
    }

    const title = this.replaceVariables(config.title || 'Notification', context)
    const message = this.replaceVariables(config.message || '', context)
    const icon = config.icon
    const badge = config.badge
    const actions = config.actions || []

    // Buscar subscriptions de cada usuário
    const subscriptionsResults = await Promise.all(
      config.userIds.map(async (userId: string) => {
        const subscriptions = await db.subscription.findMany({
          where: { userId },
        })
        return subscriptions
      })
    )

    const allSubscriptions = subscriptionsResults.flat()

    if (allSubscriptions.length === 0) {
      console.log('No push subscriptions found for users')
      return {
        success: true,
        type: 'push_notification',
        subscriptionsSent: 0,
        message: 'No push subscriptions found for users',
      }
    }

    // Preparar payload da notificação
    const payload = {
      title,
      body: message,
      icon,
      badge,
      data: {
        workflowContext: context,
        actions,
        createdAt: new Date(),
      },
      actions,
    }

    // Enviar notificação push para todas as subscriptions
    let success = 0
    let failed = 0

    const sendPromises = allSubscriptions.map(async (subscription) => {
      try {
        await sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        )

        success++
      } catch (error: any) {
        failed++
        console.error('Failed to send push notification:', error.message)

        // Se subscription expirou, deletar do banco
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          await db.subscription.delete({
            where: { id: subscription.id },
          })
        }
      }
    })

    await Promise.allSettled(sendPromises)

    console.log(`🔔 Push notifications sent: ${success} success, ${failed} failed`)

    return {
      success: true,
      type: 'push_notification',
      subscriptionsSent: success,
      subscriptionsFailed: failed,
      message: `Push notification sent to ${success} device(s)`,
    }
  },

  replaceVariables(template: string, context: ExecutionContext): string {
    if (!template || typeof template !== 'string') {
      return template
    }

    let result = template

    // Mapear variáveis do contexto
    const variables: Record<string, any> = {
      'product.name': context.product?.name || '',
      'product.stock': context.product?.stock || 0,
      'product.id': context.product?.id || '',
      'store.name': context.store?.name || '',
      'store.id': context.store?.id || '',
      'movement.type': context.movement?.type || '',
      'movement.quantity': context.movement?.quantity || 0,
      'movement.id': context.movement?.id || '',
      'user.name': context.user?.name || '',
      'user.email': context.user?.email || '',
    }

    // Substituir variáveis do formato {{variable}}
    result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, varName) => {
      // Tentar acessar a variável diretamente
      const value = this.getNestedValue(context, varName)

      if (value !== undefined && value !== null) {
        return String(value)
      }

      // Tentar via map
      if (variables[varName] !== undefined) {
        return String(variables[varName])
      }

      return match // Retornar original se não encontrado
    })

    return result
  },

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  },
}
