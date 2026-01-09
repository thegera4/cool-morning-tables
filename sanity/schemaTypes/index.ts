import { type SchemaTypeDefinition } from 'sanity'
import { productType } from './productType'
import { orderType } from './orderType'
import { customerType } from './customerType'
import { extraType } from './extraType'
import { settingsType } from './settingsType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, orderType, customerType, extraType, settingsType],
}