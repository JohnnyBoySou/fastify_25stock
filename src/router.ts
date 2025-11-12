import type { FastifyInstance } from 'fastify'

import { AuthRoutes } from '@/features/(core)/auth/auth.routes'
import { CategoryRoutes } from '@/features/(erp)/category/category.routes'
import { ChatRoutes } from '@/features/(ai)/chat/chat.routes'
import { CrmRoutes } from '@/features/(crm)/contact/crm.routes'
import { FlowRoutes } from '@/features/(ai)/flow/flow.routes'
import { InvoiceRoutes } from '@/features/invoice/invoice.routes'
import { MovementRoutes } from '@/features/(erp)/movement/movement.routes'
import { NotificationRoutes } from '@/features/(core)/notification/notification.routes'
import { PolarRoutes } from '@/features/polar/polar.routes'
import { ProductRoutes } from '@/features/(erp)/product/product.routes'
import { ProfileRoutes } from '@/features/(core)/profile/profile.routes'
import { QuoteRoutes } from '@/features/(crm)/quote/quote.routes'
import { RoadmapRoutes } from '@/features/(pms)/roadmap/roadmap.routes'
import { StoreRoutes } from '@/features/(core)/store/store.routes'
import { DocumentRoutes } from '@/features/(pms)/document/document.routes'
import { FolderRoutes } from '@/features/(pms)/document/folder.routes'
import { PermissionRoutes } from '@/features/(core)/permission/permission.routes'
import { SubscriptionRoutes } from '@/features/subscription/subscription.routes'
import { SupplierRoutes } from '@/features/(erp)/supplier/supplier.routes'
import { GalleryRoutes } from '@/features/(pms)/gallery/gallery.route'
import { UserPreferencesRoutes } from '@/features/(core)/preferences/user-preferences.routes'
import { UserRoutes } from '@/features/(core)/user/user.routes'
import { ShiftRoutes } from './features/(wfm)/shift/shift.routes'
import { ScheduleRoutes } from './features/(wfm)/schedule/schedule.routes'
import { SpaceRoutes } from './features/(wfm)/space/space.routes'

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
  await fastify.register(GalleryRoutes, { prefix: '/gallery' })
  await fastify.register(ShiftRoutes, { prefix: '/shifts' })
  await fastify.register(ScheduleRoutes, { prefix: '/schedules' })
  await fastify.register(SpaceRoutes, { prefix: '/spaces' })
}
