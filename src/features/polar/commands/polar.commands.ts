import type { AuthUser } from '@/features/(core)/auth/auth.interfaces'
import { polar } from '@/plugins/polar'
import { db } from '@/plugins/prisma'

export const PolarCommands = {
  async checkout(data: {
    productId: string
    customer: AuthUser
  }) {
    try {
      const checkout = await polar.checkouts.create({
        customerBillingAddress: {
          country: 'BR',
        },
        customerEmail: data.customer.email,
        customerName: data.customer.name,
        products: [data.productId],
      })
      if (!checkout) {
        throw new Error('Failed to create checkout')
      }
      return checkout
    } catch (error) {
      console.error('Polar checkout error:', error)
      throw new Error('Failed to create checkout')
    }
  },

  async webhook(event: any) {
    try {
      // Tipos possíveis relevantes para este projeto:
      // - 'order.created' | 'order.updated' | 'order.paid' | 'order.refunded'
      // - 'customer.state_changed' (ver docs Polar)
      // - eventos anteriores mantidos para compat

      const type: string = event?.type || ''
      const data = event?.data || {}

      // Helpers
      const findOrCreateSubscriptionByUserId = async (userId: string) => {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            storeId: true,
            ownedStore: {
              select: {
                id: true,
              },
            },
          },
        })
        if (!user) return null

        const storeId = user.storeId || user.ownedStore?.id
        if (!storeId) return null

        let subscription = await db.subscription.findUnique({ where: { storeId } })
        if (!subscription) {
          subscription = await db.subscription.create({
            data: {
              storeId,
              status: 'ACTIVE',
            },
          })
        }
        return subscription
      }

      const findSubscriptionByPolarOrEmail = async (opts: {
        polarCustomerId?: string | null
        email?: string | null
      }) => {
        const { polarCustomerId, email } = opts
        if (polarCustomerId) {
          const byPolar = await db.subscription.findUnique({
            where: { polarCustomerId },
          })
          if (byPolar) return byPolar
        }
        if (email) {
          const user = await db.user.findFirst({
            where: { email },
            select: {
              id: true,
              storeId: true,
              ownedStore: {
                select: { id: true },
              },
            },
          })
          if (user) {
            const storeId = user.storeId || user.ownedStore?.id
            if (storeId) {
              const subscription = await db.subscription.findUnique({ where: { storeId } })
              if (subscription) return subscription
              return await findOrCreateSubscriptionByUserId(user.id)
            }
          }
        }
        return null
      }

      const setSubscriptionPlanAndStatus = async (
        subscriptionId: string,
        polarProductId: string | null,
        status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIAL' | 'EXPIRED' | 'PAST_DUE',
        renewalDate?: Date | null,
        trialEndsAt?: Date | null
      ) => {
        return await db.subscription.update({
          where: { id: subscriptionId },
          data: {
            polarProductId: polarProductId || null,
            status,
            currentPeriodEnd: renewalDate || null,
            trialEndsAt: trialEndsAt || null,
          },
        })
      }

      const upsertInvoice = async (
        subscriptionId: string,
        amountCents?: number | null,
        polarInvoiceId?: string | null,
        status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' = 'PENDING',
        paymentDate?: Date | null
      ) => {
        if (!amountCents && !polarInvoiceId) return null
        const amount = amountCents ? Number(amountCents) / 100 : 0
        const existing = polarInvoiceId
          ? await db.invoice.findUnique({ where: { polarInvoiceId } })
          : null
        if (existing) {
          return await db.invoice.update({
            where: { id: existing.id },
            data: {
              status,
              paymentDate: paymentDate || existing.paymentDate || null,
            },
          })
        }
        return await db.invoice.create({
          data: {
            subscriptionId,
            amount,
            status,
            polarInvoiceId: polarInvoiceId || null,
            paymentDate: paymentDate || null,
          },
        })
      }

      // Compat: eventos antigos do handler anterior
      const checkout = data?.checkout_session
      const subscription = data?.subscription

      switch (type) {
        case 'checkout.succeeded': {
          const userIdFromMetadata = checkout?.metadata?.user_id as string | undefined
          const polarCustomerId = checkout?.customer_id as string | undefined
          const polarSubscriptionId = checkout?.subscription_id as string | undefined

          if (userIdFromMetadata) {
            const subscription = await findOrCreateSubscriptionByUserId(userIdFromMetadata)
            if (!subscription) break
            await db.subscription.update({
              where: { id: subscription.id },
              data: {
                polarCustomerId: polarCustomerId || subscription.polarCustomerId || null,
                polarSubscriptionId:
                  polarSubscriptionId || subscription.polarSubscriptionId || null,
              },
            })
          } else if (polarCustomerId) {
            const subscription = await findSubscriptionByPolarOrEmail({
              polarCustomerId,
              email: null,
            })
            if (subscription) {
              await db.subscription.update({
                where: { id: subscription.id },
                data: {
                  polarCustomerId,
                  polarSubscriptionId:
                    polarSubscriptionId || subscription.polarSubscriptionId || null,
                },
              })
            }
          }
          break
        }

        case 'subscription.created':
        case 'subscription.updated':
        case 'subscription.canceled': {
          const polarCustomerId = subscription?.customer_id as string | undefined
          const polarSubscriptionId = subscription?.id as string | undefined
          if (polarCustomerId || polarSubscriptionId) {
            const sub = await findSubscriptionByPolarOrEmail({ polarCustomerId, email: null })
            if (sub) {
              await db.subscription.update({
                where: { id: sub.id },
                data: {
                  polarCustomerId: polarCustomerId || sub.polarCustomerId || null,
                  polarSubscriptionId: polarSubscriptionId || sub.polarSubscriptionId || null,
                },
              })
            }
          }
          break
        }

        // === NOVOS EVENTOS DE ORDER ===
        case 'order.created':
        case 'order.updated': {
          // Mantemos referência a subscription/product, mas não mudamos status/plano até pagamento
          const order = data
          const polarCustomerId: string | undefined = order?.customer_id || order?.customerId
          const email: string | undefined = order?.customer?.email || order?.email
          const productId: string | undefined = order?.product_id || order?.productId

          const sub = await findSubscriptionByPolarOrEmail({ polarCustomerId, email })
          if (sub) {
            // Vincular ids Polar conhecidos
            await db.subscription.update({
              where: { id: sub.id },
              data: {
                polarCustomerId: polarCustomerId || sub.polarCustomerId || null,
                polarProductId: productId || sub.polarProductId || null,
              },
            })
          }
          break
        }

        case 'order.paid': {
          const order = data
          const polarCustomerId: string | undefined = order?.customer_id || order?.customerId
          const email: string | undefined = order?.customer?.email || order?.email
          const productId: string | undefined = order?.product_id || order?.productId
          const amountCents: number | undefined =
            order?.amount || order?.amount_cents || order?.total_amount_cents
          const invoiceId: string | undefined = order?.invoice_id || order?.invoiceId
          const currentPeriodEndIso: string | undefined = order?.current_period_end

          const sub = await findSubscriptionByPolarOrEmail({ polarCustomerId, email })
          if (!sub) break

          const renewalDate = currentPeriodEndIso ? new Date(currentPeriodEndIso) : null
          await setSubscriptionPlanAndStatus(sub.id, productId || null, 'ACTIVE', renewalDate, null)
          await upsertInvoice(sub.id, amountCents, invoiceId || null, 'PAID', new Date())
          break
        }

        case 'order.refunded': {
          const order = data
          const polarCustomerId: string | undefined = order?.customer_id || order?.customerId
          const email: string | undefined = order?.customer?.email || order?.email
          const invoiceId: string | undefined = order?.invoice_id || order?.invoiceId

          const sub = await findSubscriptionByPolarOrEmail({ polarCustomerId, email })
          if (!sub) break
          await setSubscriptionPlanAndStatus(sub.id, sub.polarProductId, 'INACTIVE', null, null)
          await upsertInvoice(sub.id, null, invoiceId || null, 'REFUNDED', null)
          break
        }

        case 'customer.state_changed': {
          // Docs: https://polar.sh/docs/api-reference/webhooks/customer.state_changed
          // data.email, data.active_subscriptions[], each has product_id, status, current_period_end, trial_* etc
          const email: string | undefined = data?.email
          const polarCustomerId: string | undefined = data?.id
          const activeSub =
            Array.isArray(data?.active_subscriptions) && data.active_subscriptions.length > 0
              ? data.active_subscriptions[0]
              : null

          const sub = await findSubscriptionByPolarOrEmail({ polarCustomerId, email })
          if (!sub) break

          const productId: string | undefined = activeSub?.product_id
          const statusMap: Record<
            string,
            'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'TRIAL' | 'EXPIRED' | 'PAST_DUE'
          > = {
            active: 'ACTIVE',
            trialing: 'TRIAL',
            canceled: 'CANCELLED',
            paused: 'INACTIVE',
            past_due: 'PAST_DUE',
            expired: 'EXPIRED',
          } as const

          const subStatus: string | undefined = activeSub?.status
          const mappedStatus = subStatus && statusMap[subStatus] ? statusMap[subStatus] : 'ACTIVE'
          const renewalDate = activeSub?.current_period_end
            ? new Date(activeSub.current_period_end)
            : null
          const trialEndsAt = activeSub?.trial_end ? new Date(activeSub.trial_end) : null

          await db.subscription.update({
            where: { id: sub.id },
            data: {
              polarCustomerId: polarCustomerId || sub.polarCustomerId || null,
              polarSubscriptionId: activeSub?.id || sub.polarSubscriptionId || null,
            },
          })

          await setSubscriptionPlanAndStatus(
            sub.id,
            productId || null,
            mappedStatus,
            renewalDate,
            trialEndsAt
          )
          break
        }

        default:
          break
      }

      return { success: true }
    } catch (error: any) {
      // Logar erro no console por ser camada de commands
      console.error('Polar webhook error:', error)
      return { success: false, error: error?.message || 'Internal error' }
    }
  },

  async createSubscription(data: {
    customerId: string
    productId: string
  }) {
    try {
      const subscription = await polar.subscriptions.create({
        customerId: data.customerId,
        productId: data.productId,
      })

      return subscription
    } catch (error) {
      console.error('Polar create subscription error:', error)
      return null
    }
  },

  async createCustomer(data: {
    email: string
    name: string
    externalId: string // user.id
  }) {
    try {
      const customer = await polar.customers.create({
        email: data.email,
        name: data.name,
        externalId: data.externalId,
        //organizationId: process.env.POLAR_ORGANIZATION_ID as string,
      })

      return customer
    } catch (error) {
      console.error('Polar create customer error:', error)
      return null
    }
  },
}
