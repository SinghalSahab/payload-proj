import type { CollectionConfig } from 'payload'

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
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      if (user.role === 'tenant-admin' || user.role === 'user') {
        return {
          tenant: { equals: user.tenant },
        }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      if (user.role === 'tenant-admin') {
        return {
          tenant: { equals: user.tenant },
        }
      }
      // Users can update themselves
      return {
        id: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      if (user.role === 'tenant-admin') {
        return {
          tenant: { equals: user.tenant },
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      if (user.role === 'tenant-admin') return true
      return false
    },
  },
}
