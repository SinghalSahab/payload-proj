import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return {
        tenant: { equals: user.tenant },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return {
        tenant: { equals: user.tenant },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return {
        tenant: { equals: user.tenant },
      }
    },
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
