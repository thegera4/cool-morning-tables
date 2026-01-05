'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { esESLocale } from '@sanity/locale-es-es'
import { ShareIcon } from '@sanity/icons'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { ExportTool } from './sanity/tools/export-tool'
import { PublishOrderAction } from './sanity/actions/publish-order'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    // visionTool({ defaultApiVersion: apiVersion }),
    esESLocale(),
  ],
  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'export-data',
        title: 'Export',
        component: ExportTool,
        icon: ShareIcon
      }
    ]
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'order') {
        return prev.map((originalAction) =>
          originalAction.action === 'publish' ? PublishOrderAction : originalAction
        )
      }
      return prev
    },
  },
})
