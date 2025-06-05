import type { CollectionConfig } from 'payload'
import type { Access, Where } from 'payload/types'

const isSuperAdmin = (user: any) => user?.role === 'super-admin'
const isTenantAdmin = (user: any) => user?.role === 'tenant-admin'
const isUser = (user: any) => user?.role === 'user'

const tenantAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (isTenantAdmin(user) || isUser(user)) {
    return {
      tenant: {
        equals: user.tenant?.id || user.tenant,
      },
    }
  }
  return false
}

const tenantAdminAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (isTenantAdmin(user)) {
    return {
      tenant: {
        equals: user.tenant?.id || user.tenant,
      },
    }
  }
  return false
}

const selfAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (isTenantAdmin(user)) {
    return {
      tenant: {
        equals: user.tenant?.id || user.tenant,
      },
    }
  }
  return {
    id: {
      equals: user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Tenant Admin', value: 'tenant-admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false, // Required for non-super-admins
      admin: {
        condition: (data) => data.role !== 'super-admin',
      },
    },
    // Email added by default
    // Add more fields as needed
  ],
  access: {
    read: tenantAccess,
    update: selfAccess,
    delete: tenantAdminAccess,
    create: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (isTenantAdmin(user)) return true
      return false
    },
  },
}
