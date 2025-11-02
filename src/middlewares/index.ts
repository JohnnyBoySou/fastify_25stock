import { Auth } from './auth.middleware'
import { Permission } from './permission.middleware'
import { Store } from './store.middleware'

export const Middlewares = {
  auth: Auth,
  store: Store,
  permission: Permission,
}
