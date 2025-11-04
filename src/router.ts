import type { FastifyInstance } from 'fastify'

import { AuthRoutes } from '@/features/auth/auth.routes'
import { CategoryRoutes } from '@/features/category/category.routes'
import { ChatRoutes } from '@/features/chat/chat.routes'
import { CrmRoutes } from '@/features/crm/crm.routes'
import { FlowRoutes } from '@/features/flow/flow.routes'
import { InvoiceRoutes } from '@/features/invoice/invoice.routes'
import { MovementRoutes } from '@/features/movement/movement.routes'
import { NotificationRoutes } from '@/features/notification/notification.routes'
import { PolarRoutes } from '@/features/polar/polar.routes'
import { ProductRoutes } from '@/features/product/product.routes'
import { ProfileRoutes } from '@/features/profile/profile.routes'
import { QuoteRoutes } from '@/features/quote/quote.routes'
import { RoadmapRoutes } from '@/features/roadmap/roadmap.routes'
import { StoreRoutes } from '@/features/store/store.routes'
import { DocumentRoutes } from '@/features/document/document.routes'
import { FolderRoutes } from '@/features/document/folder.routes'
import { PermissionRoutes } from '@/features/permission/permission.routes'
import { SubscriptionRoutes } from '@/features/subscription/subscription.routes'
import { SupplierRoutes } from '@/features/supplier/supplier.routes'
import { UploadRoutes } from '@/features/upload/upload.route'
import { UserPreferencesRoutes } from '@/features/user-preferences/user-preferences.routes'
import { UserRoutes } from '@/features/user/user.routes'
import { ShiftRoutes } from './features/booking/shift/shift.routes'
import { ScheduleRoutes } from './features/booking/schedule/schedule.routes'
import { SpaceRoutes } from './features/booking/space/space.routes'

export async function registerRoutes(fastify: FastifyInstance) {
  // Auth
  await fastify.register(AuthRoutes, { prefix: '/auth' })

  // Features
  await fastify.register(UserRoutes, { prefix: '/users' })
  await fastify.register(PermissionRoutes, { prefix: '/permissions' })
  await fastify.register(ProductRoutes, { prefix: '/products' })
  await fastify.register(SupplierRoutes, { prefix: '/suppliers' })
  await fastify.register(CategoryRoutes, { prefix: '/categories' })
  await fastify.register(MovementRoutes, { prefix: '/movements' })
  await fastify.register(NotificationRoutes, { prefix: '/notifications' })
  await fastify.register(ChatRoutes, { prefix: '/chat' })
  await fastify.register(RoadmapRoutes, { prefix: '/roadmaps' })
  await fastify.register(QuoteRoutes, { prefix: '/quotes' })
  await fastify.register(InvoiceRoutes, { prefix: '/invoices' })
  await fastify.register(CrmRoutes, { prefix: '/crm' })
  await fastify.register(UserPreferencesRoutes, { prefix: '/preferences' })
  await fastify.register(FlowRoutes, { prefix: '/flows' })
  await fastify.register(DocumentRoutes, { prefix: '/documents' })
  await fastify.register(FolderRoutes, { prefix: '/folders' })
  await fastify.register(PolarRoutes, { prefix: '/polar' })
  await fastify.register(StoreRoutes, { prefix: '/store' })
  await fastify.register(ProfileRoutes, { prefix: '/profile' })
  await fastify.register(SubscriptionRoutes, { prefix: '/subscriptions' })
  await fastify.register(UploadRoutes, { prefix: '/uploads' })
  //  await fastify.register(PushSubscriptionRoutes, { prefix: '/push-subscriptions' })

  // Feature Booking
  await fastify.register(ShiftRoutes, { prefix: '/shifts' })
  await fastify.register(ScheduleRoutes, { prefix: '/schedules' })
  await fastify.register(SpaceRoutes, { prefix: '/spaces' })
}
