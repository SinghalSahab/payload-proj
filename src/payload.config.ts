// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { Tenants } from './collections/Tenants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Tenants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    formBuilderPlugin({
      formOverrides: {
        fields: ({ defaultFields }) => {
          return [
            ...defaultFields,
            {
              name: 'tenant',
              type: 'relationship',
              relationTo: 'tenants',
              required: true,
              admin: {
                position: 'sidebar',
                condition: () => false, // hides from UI
              },
              access: {
                create: () => false,
                update: () => false,
              },
            },
          ]
        },
        access: {
          read: ({ req }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin') // Check if user is a super admin
            if (isSuperAdmin) return true // Super admin can access all forms

            const tenant = req.user?.tenant
            const tenantId = typeof tenant === 'object' ? tenant?.id : tenant

            if (!tenantId) return false

            return {
              tenant: {
                equals: tenantId,
              },
            }
          },
          create: ({ req }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin')
            if (isSuperAdmin) return true // Super admin can create forms

            return !!req.user?.tenant // Tenant admins can create forms for their tenant
          },
          update: ({ req, data }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin')
            if (isSuperAdmin) return true // Super admin can update forms

            const tenant = req.user?.tenant
            const tenantId = typeof tenant === 'object' ? tenant?.id : tenant

            return data?.tenant === tenantId // Tenant admins can update forms for their tenant
          },
          delete: ({ req, data }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin')
            if (isSuperAdmin) return true // Super admin can delete forms

            const tenant = req.user?.tenant
            const tenantId = typeof tenant === 'object' ? tenant?.id : tenant

            return data?.tenant === tenantId // Tenant admins can delete forms for their tenant
          },
        },
        hooks: {
          beforeChange: [
            ({ req, data, operation }) => {
              if (operation === 'create' && req.user?.tenant) {
                const tenant = req.user.tenant
                data.tenant = typeof tenant === 'object' ? tenant.id : tenant
              }
              return data
            },
          ],
        },
      },
      formSubmissionOverrides: {
        access: {
          read: ({ req }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin') // Check if user is a super admin
            if (isSuperAdmin) return true // Super admin can access all form submissions

            const tenant = req.user?.tenant
            const tenantId = typeof tenant === 'object' ? tenant?.id : tenant

            if (!tenantId) return false

            return {
              and: [
                {
                  'form.tenant': {
                    equals: tenantId,
                  },
                },
              ],
            }
          },
          create: ({ req }) => {
            const isSuperAdmin = req.user?.role?.includes('super-admin')
            if (isSuperAdmin) return true // Super admin can create form submissions

            return !!req.user?.tenant // Tenant admins can create form submissions for their tenant
          },
        },
      },
    }),
    // storage-adapter-placeholder
  ],
})
